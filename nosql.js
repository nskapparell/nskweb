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
    name: "Signature Forest Green Tipped Polo",
    price: 599,
    originalPrice: 999,
    category: "tees",
    sizes: ["S", "M", "L", "XL"],
    image: "assets/images/products/rs599_01.jpg",
    description: "Classic forest green pique polo featuring contrast white tipping on the collar and sleeves with heritage chest embroidery. Premium breathable cotton blend.",
    badge: "Bestseller",
    inStock: true,
    featured: true,
    rating: 4.8,
    reviews: 184
  },
  {
    name: "Heritage Crimson Crest Embroidered Polo",
    price: 599,
    originalPrice: 1099,
    category: "tees",
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "assets/images/products/rs599_02.jpg",
    description: "Rich crimson red polo with golden crest chest embroidery and gold horizontal banner detail. Ultra-soft combed cotton for everyday luxury.",
    badge: "Rs. 599 Deal",
    inStock: true,
    featured: true,
    rating: 4.9,
    reviews: 245
  },
  {
    name: "Ocean Blue Shield Crest Tipped Polo",
    price: 599,
    originalPrice: 999,
    category: "tees",
    sizes: ["S", "M", "L", "XL"],
    image: "assets/images/products/rs599_03.jpg",
    description: "Crisp ocean blue polo with dual white collar stripes and regal shield crest embroidery. Tailored regular fit with ribbed collar.",
    badge: "Hot",
    inStock: true,
    featured: true,
    rating: 4.7,
    reviews: 120
  },
  {
    name: "Midnight Navy Monogram Polo",
    price: 599,
    originalPrice: 1199,
    category: "tees",
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "assets/images/products/rs599_04.jpg",
    description: "Deep midnight navy polo with subtle tonal crest embroidery and signature tricolor placket accent. Modern minimalist street aesthetic.",
    badge: "Limited",
    inStock: true,
    featured: true,
    rating: 5.0,
    reviews: 89
  },
  {
    name: "Golden Script Obsidian Black Polo",
    price: 599,
    originalPrice: 1299,
    category: "tees",
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "assets/images/products/rs599_05.jpg",
    description: "Luxurious obsidian black polo with bold golden typographic chest embroidery and tricolor ribbed cuffs. High-density pique knit.",
    badge: "Bestseller",
    inStock: true,
    featured: true,
    rating: 4.9,
    reviews: 312
  },
  {
    name: "Mocha Brown Heritage Polo",
    price: 599,
    originalPrice: 999,
    category: "tees",
    sizes: ["S", "M", "L", "XL"],
    image: "assets/images/products/rs599_06.jpg",
    description: "Sophisticated mocha brown polo with heritage banner embroidery and fine dual-stripe ribbed collar. Premium washed cotton finish.",
    badge: "Trending",
    inStock: true,
    featured: false,
    rating: 4.6,
    reviews: 95
  },
  {
    name: "Alpine White Grand Prix Racing Polo",
    price: 599,
    originalPrice: 1299,
    category: "tees",
    sizes: ["S", "M", "L", "XL"],
    image: "assets/images/products/rs599_07.jpg",
    description: "Sporty alpine white performance polo with motorsport chest badges, contrast tricolor racing side stripes, and collar piping.",
    badge: "New Drop",
    inStock: true,
    featured: true,
    rating: 5.0,
    reviews: 167
  },
  {
    name: "Sunset Tangerine Contrast Stripe Polo",
    price: 599,
    originalPrice: 1099,
    category: "tees",
    sizes: ["S", "M", "L", "XL"],
    image: "assets/images/products/rs599_08.jpg",
    description: "Vibrant sunset orange polo with navy and white chest block stripes, contrast navy collar, and fine sleeve flag detail.",
    badge: "Popular",
    inStock: true,
    featured: true,
    rating: 4.7,
    reviews: 142
  },
  {
    name: "Vintage Ivory 1890 Mascot Graphic Polo",
    price: 599,
    originalPrice: 999,
    category: "tees",
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "assets/images/products/rs599_09.jpg",
    description: "Off-white pique polo featuring classic collegiate mascot back print and 1890 heritage typography. Breathable combed cotton.",
    badge: "Vintage",
    inStock: true,
    featured: false,
    rating: 4.8,
    reviews: 78
  },
  {
    name: "Blaze Coral Collar Graphic Polo",
    price: 599,
    originalPrice: 999,
    category: "tees",
    sizes: ["S", "M", "L", "XL"],
    image: "assets/images/products/rs599_10.jpg",
    description: "Eye-catching blaze coral polo with contrast navy back-collar typography and racing shoulder piping. High-comfort pique weave.",
    badge: "Rs. 599 Deal",
    inStock: true,
    featured: false,
    rating: 4.5,
    reviews: 63
  },
  {
    name: "Scarlet Red Star Crest Denim Polo",
    price: 599,
    originalPrice: 1099,
    category: "tees",
    sizes: ["S", "M", "L", "XL"],
    image: "assets/images/products/rs599_11.jpg",
    description: "Bold scarlet red polo with navy contrast collar and five-star roundel crest embroidery. Double-needle hem and sleeve cuffs.",
    badge: "Hot",
    inStock: true,
    featured: true,
    rating: 4.8,
    reviews: 114
  },
  {
    name: "Westchester Cup Tournament Navy Polo",
    price: 599,
    originalPrice: 1399,
    category: "tees",
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "assets/images/products/rs599_12.jpg",
    description: "Premium dark navy polo featuring elaborate Westchester Cup dual-horse and flag back embroidery. The quintessential polo classic.",
    badge: "Exclusive",
    inStock: true,
    featured: true,
    rating: 5.0,
    reviews: 288
  },
  {
    name: "Cadet Blue NYC Circular Crest Polo",
    price: 599,
    originalPrice: 999,
    category: "tees",
    sizes: ["S", "M", "L", "XL"],
    image: "assets/images/products/rs599_13.jpg",
    description: "Clean cadet blue polo with circular NYC chest typography and tricolor tab placket detail. Pre-shrunk cotton for long-lasting fit.",
    badge: "Trending",
    inStock: true,
    featured: false,
    rating: 4.6,
    reviews: 82
  },
  {
    name: "Espresso Brown Established Logo Polo",
    price: 599,
    originalPrice: 1199,
    category: "tees",
    sizes: ["S", "M", "L", "XL"],
    image: "assets/images/products/rs599_14.jpg",
    description: "Understated espresso brown polo with clean horizontal logo embroidery and relaxed street fit. Premium 220 GSM pique fabric.",
    badge: "Rs. 599 Deal",
    inStock: true,
    featured: false,
    rating: 4.7,
    reviews: 91
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
