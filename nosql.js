/* ============================================================
   NSK APPAREL — Embedded NoSQL Document Database
   Fast, zero-config, persistent JSON document store
   Fully compatible with Mongoose query & document interface
   ============================================================ */

'use strict';

const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const crypto = require('crypto');

const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
let dataDir = path.join(__dirname, 'data');

if (isServerless) {
  try {
    const tmpDataDir = path.join(os.tmpdir(), 'nsk_data');
    if (!fs.existsSync(tmpDataDir)) fs.mkdirSync(tmpDataDir, { recursive: true });
    // Copy bundled seed files to /tmp so they can be read and written
    if (fs.existsSync(dataDir)) {
      for (const file of fs.readdirSync(dataDir)) {
        const src = path.join(dataDir, file);
        const dst = path.join(tmpDataDir, file);
        if (!fs.existsSync(dst) && fs.statSync(src).isFile()) {
          fs.copyFileSync(src, dst);
        }
      }
    }
    dataDir = tmpDataDir;
  } catch (err) {
    console.warn('Serverless tmp dataDir warning:', err.message);
  }
} else {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  } catch (_) {}
}

function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

function clone(obj) {
  return obj ? JSON.parse(JSON.stringify(obj)) : null;
}

function filterFields(doc, includeFields, excludeFields) {
  if (!doc) return doc;
  const copy = { ...doc };
  if (excludeFields.length > 0) {
    for (const f of excludeFields) delete copy[f];
  }
  if (includeFields.length > 0) {
    const filtered = {};
    for (const f of includeFields) {
      if (copy[f] !== undefined) filtered[f] = copy[f];
    }
    if (copy._id !== undefined) filtered._id = copy._id;
    return filtered;
  }
  return copy;
}

class QueryChain {
  constructor(fetchFn) {
    this.fetchFn = fetchFn;
    this.modifiers = [];
  }

  select(fieldsStr) {
    if (fieldsStr) this.modifiers.push({ type: 'select', value: fieldsStr });
    return this;
  }

  sort(sortObj) {
    if (sortObj) this.modifiers.push({ type: 'sort', value: sortObj });
    return this;
  }

  async exec() {
    let result = await this.fetchFn();
    for (const mod of this.modifiers) {
      if (mod.type === 'sort' && Array.isArray(result)) {
        const [sortKey, sortDir] = Object.entries(mod.value)[0] || ['createdAt', -1];
        const dir = sortDir === -1 ? -1 : 1;
        result.sort((a, b) => {
          const valA = a[sortKey];
          const valB = b[sortKey];
          if (valA === undefined) return 1;
          if (valB === undefined) return -1;
          if (valA < valB) return -1 * dir;
          if (valA > valB) return 1 * dir;
          return 0;
        });
      }

      if (mod.type === 'select') {
        const parts = mod.value.split(/\s+/).filter(Boolean);
        const exclude = parts.filter(p => p.startsWith('-')).map(p => p.slice(1));
        const include = parts.filter(p => !p.startsWith('-'));

        if (Array.isArray(result)) {
          result = result.map(item => filterFields(item, include, exclude));
        } else if (result) {
          result = filterFields(result, include, exclude);
        }
      }
    }
    return result;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

class Collection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(dataDir, `${name}.json`);
    this.fileExists = fs.existsSync(this.filePath);
    this.docs = [];
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.docs = JSON.parse(raw);
      } else {
        this.docs = [];
        this.save();
      }
    } catch (err) {
      console.error(`Failed to load ${this.name} database:`, err.message);
      this.docs = [];
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.docs, null, 2), 'utf8');
    } catch (err) {
      console.error(`Failed to save ${this.name} database:`, err.message);
    }
  }

  countDocuments() {
    return Promise.resolve(this.docs.length);
  }

  findOne(query = {}) {
    return new QueryChain(async () => {
      const match = this.docs.find(doc => {
        for (const key of Object.keys(query)) {
          if (key === 'email' && doc.email && query.email) {
            if (doc.email.toLowerCase() !== String(query.email).toLowerCase()) return false;
          } else if (String(doc[key]) !== String(query[key])) {
            return false;
          }
        }
        return true;
      });
      return match ? clone(match) : null;
    });
  }

  findById(id) {
    return new QueryChain(async () => {
      const targetId = id?._id ? String(id._id) : String(id);
      const doc = this.docs.find(d => String(d._id) === targetId);
      return doc ? clone(doc) : null;
    });
  }

  find(filter = {}) {
    return new QueryChain(async () => {
      const matches = this.docs.filter(doc => {
        for (const [key, val] of Object.entries(filter)) {
          if (val === undefined) continue;
          if (key === 'user' && doc.user) {
            if (String(doc.user) !== String(val)) return false;
          } else if (typeof val === 'boolean') {
            if (Boolean(doc[key]) !== val) return false;
          } else if (String(doc[key]) !== String(val)) {
            return false;
          }
        }
        return true;
      });
      return clone(matches);
    });
  }

  async create(data) {
    const doc = {
      _id: generateId(),
      ...clone(data),
      createdAt: data.createdAt || new Date().toISOString(),
    };
    this.docs.push(doc);
    this.save();
    return clone(doc);
  }

  findByIdAndUpdate(id, update, options = {}) {
    return new QueryChain(async () => {
      const targetId = id?._id ? String(id._id) : String(id);
      const index = this.docs.findIndex(d => String(d._id) === targetId);
      if (index === -1) return null;

      const current = this.docs[index];
      const merged = { ...current, ...clone(update), _id: current._id, createdAt: current.createdAt };
      this.docs[index] = merged;
      this.save();
      return clone(merged);
    });
  }

  findByIdAndDelete(id) {
    return new QueryChain(async () => {
      const targetId = id?._id ? String(id._id) : String(id);
      const index = this.docs.findIndex(d => String(d._id) === targetId);
      if (index === -1) return null;
      const [deleted] = this.docs.splice(index, 1);
      this.save();
      return clone(deleted);
    });
  }
}

// ── Instantiate Collections ───────────────────────────────────────
const User    = new Collection('users');
const Product = new Collection('products');
const Order   = new Collection('orders');

// ── Default Streetwear Catalog Seed ──────────────────────────────
const DEFAULT_PRODUCTS = [
  {
    name: 'Classic Crest White Tee',
    price: 849,
    originalPrice: 1299,
    category: 'tees',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'assets/images/tshirt_white.jpg',
    description: 'Our iconic NSK Crest tee crafted from 100% premium ring-spun cotton. Oversized fit with drop-shoulder cut for that perfect streetwear silhouette.',
    badge: 'Best Seller',
    inStock: true,
    featured: true,
    rating: 4.5,
    reviews: 128
  },
  {
    name: 'Urban Drop Oversized Black Tee',
    price: 999,
    originalPrice: 1499,
    category: 'tees',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image: 'assets/images/tshirt_black.jpg',
    description: 'Bold typography meets premium quality. This oversized black tee is the cornerstone of urban style.',
    badge: 'Popular',
    inStock: true,
    featured: true,
    rating: 5.0,
    reviews: 256
  },
  {
    name: 'Geometric Art Navy Oversized Tee',
    price: 1099,
    originalPrice: 1599,
    category: 'tees',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'assets/images/tshirt_navy.jpg',
    description: 'Geometric graphic art on a rich navy base. Drop-shoulder construction, 220 GSM premium cotton.',
    badge: '',
    inStock: true,
    featured: false,
    rating: 4.0,
    reviews: 89
  },
  {
    name: 'Street Authority Pullover Hoodie',
    price: 1799,
    originalPrice: 2499,
    category: 'hoodies',
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'assets/images/hoodie_black.jpg',
    description: 'Heavyweight 380 GSM fleece hoodie with kangaroo pocket. Brushed inner lining for ultimate comfort.',
    badge: 'Hot Drop',
    inStock: true,
    featured: true,
    rating: 5.0,
    reviews: 312
  },
  {
    name: 'Urban Snapback Cap',
    price: 699,
    originalPrice: 999,
    category: 'caps',
    sizes: ['Free Size'],
    image: 'assets/images/cap_product.jpg',
    description: 'Structured 6-panel snapback with embroidered logo. Adjustable snap closure, one size fits all.',
    badge: '',
    inStock: true,
    featured: false,
    rating: 4.5,
    reviews: 74
  },
  {
    name: 'Acid Wash Vintage Grey Tee',
    price: 1199,
    originalPrice: 1699,
    category: 'tees',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'assets/images/tshirt_grey.jpg',
    description: 'Premium acid wash treatment gives each piece a unique vintage character. No two tees are exactly alike.',
    badge: 'Vintage',
    inStock: true,
    featured: false,
    rating: 4.0,
    reviews: 143
  },
  {
    name: 'Premium Fleece Jogger',
    price: 1499,
    originalPrice: 2199,
    category: 'bottoms',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'assets/images/jogger_black.jpg',
    description: 'Tapered-fit fleece jogger with elastic waistband and ribbed cuffs. Pairs perfectly with any NSK tee.',
    badge: 'Essential',
    inStock: true,
    featured: true,
    rating: 5.0,
    reviews: 198
  },
  {
    name: 'Signature Drop White Tee',
    price: 749,
    originalPrice: 1099,
    category: 'tees',
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'assets/images/tshirt_white.jpg',
    description: 'Classic NSK signature drop-hem tee. Clean minimalist design with hidden branding.',
    badge: '',
    inStock: true,
    featured: false,
    rating: 4.5,
    reviews: 67
  },
  {
    name: 'Midnight Navy Drop Tee',
    price: 1249,
    originalPrice: 1799,
    category: 'tees',
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'assets/images/tshirt_navy.jpg',
    description: 'New arrival. Midnight navy colorway with architectural geometric print. Limited first drop.',
    badge: 'New',
    inStock: true,
    featured: false,
    rating: 5.0,
    reviews: 12
  },
  {
    name: 'Collegiate Arch Hoodie',
    price: 2199,
    originalPrice: 2999,
    category: 'hoodies',
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'assets/images/hoodie_black.jpg',
    description: 'Collegiate-style arch typography on premium 400 GSM fleece. Heavyweight, structured hood.',
    badge: 'Winter Special',
    inStock: true,
    featured: true,
    rating: 4.8,
    reviews: 45
  },
  {
    name: 'Stone Wash Oversized Tee',
    price: 1349,
    originalPrice: 1899,
    category: 'tees',
    sizes: ['XS', 'S', 'M', 'L'],
    image: 'assets/images/tshirt_grey.jpg',
    description: 'Stone washed for a perfectly worn-in feel right out of the bag. Pairs with everything.',
    badge: '',
    inStock: true,
    featured: false,
    rating: 5.0,
    reviews: 28
  }
];

// Seed default products only on initial installation if empty and file did not exist
if (!Product.fileExists && Product.docs.length === 0) {
  for (const p of DEFAULT_PRODUCTS) {
    Product.create(p);
  }
  console.log(`📦 Seeded ${DEFAULT_PRODUCTS.length} initial streetwear products to NoSQL database`);
}

module.exports = {
  User,
  Product,
  Order,
  generateId,
};
