/* =========================================
   NSK APPAREL — INTERACTIVE JAVASCRIPT
   ========================================= */

'use strict';

// ── API BASE ───────────────────────────────
const API_BASE = (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '3000'))
  ? 'http://localhost:3000'
  : '';

// ── STATE ──────────────────────────────────
const state = {
  cart: JSON.parse(localStorage.getItem('nsk_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('nsk_wishlist') || '[]'),
};

// ── PRODUCT DATA ───────────────────────────
let products = {
  "403e9fc7ed8a05473fee07be": {"id": "403e9fc7ed8a05473fee07be", "name": "Signature Forest Green Tipped Polo", "price": 599, "originalPrice": 999, "img": "assets/images/products/rs599_01.jpg", "cat": "tees", "sizes": ["S", "M", "L", "XL"], "rating": 4.8, "reviews": 184, "badge": "Bestseller", "desc": "Classic forest green pique polo featuring contrast white tipping on the collar and sleeves with heritage chest embroidery. Premium breathable cotton blend."},
  "eb0cb6982826053e5fc41016": {"id": "eb0cb6982826053e5fc41016", "name": "Heritage Crimson Crest Embroidered Polo", "price": 599, "originalPrice": 1099, "img": "assets/images/products/rs599_02.jpg", "cat": "tees", "sizes": ["S", "M", "L", "XL", "XXL"], "rating": 4.9, "reviews": 245, "badge": "Rs. 599 Deal", "desc": "Rich crimson red polo with golden crest chest embroidery and gold horizontal banner detail. Ultra-soft combed cotton for everyday luxury."},
  "6504a04f3c693156e8c06e61": {"id": "6504a04f3c693156e8c06e61", "name": "Ocean Blue Shield Crest Tipped Polo", "price": 599, "originalPrice": 999, "img": "assets/images/products/rs599_03.jpg", "cat": "tees", "sizes": ["S", "M", "L", "XL"], "rating": 4.7, "reviews": 120, "badge": "Hot", "desc": "Crisp ocean blue polo with dual white collar stripes and regal shield crest embroidery. Tailored regular fit with ribbed collar."},
  "04d0681a118f3a7f2c8f8bc1": {"id": "04d0681a118f3a7f2c8f8bc1", "name": "Midnight Navy Monogram Polo", "price": 599, "originalPrice": 1199, "img": "assets/images/products/rs599_04.jpg", "cat": "tees", "sizes": ["S", "M", "L", "XL", "XXL"], "rating": 5.0, "reviews": 89, "badge": "Limited", "desc": "Deep midnight navy polo with subtle tonal crest embroidery and signature tricolor placket accent. Modern minimalist street aesthetic."},
  "fd4dc35f0956bd5761ab9a53": {"id": "fd4dc35f0956bd5761ab9a53", "name": "Golden Script Obsidian Black Polo", "price": 599, "originalPrice": 1299, "img": "assets/images/products/rs599_05.jpg", "cat": "tees", "sizes": ["S", "M", "L", "XL", "XXL"], "rating": 4.9, "reviews": 312, "badge": "Bestseller", "desc": "Luxurious obsidian black polo with bold golden typographic chest embroidery and tricolor ribbed cuffs. High-density pique knit."},
  "043564ef26a6d9f988197922": {"id": "043564ef26a6d9f988197922", "name": "Mocha Brown Heritage Polo", "price": 599, "originalPrice": 999, "img": "assets/images/products/rs599_06.jpg", "cat": "tees", "sizes": ["S", "M", "L", "XL"], "rating": 4.6, "reviews": 95, "badge": "Trending", "desc": "Sophisticated mocha brown polo with heritage banner embroidery and fine dual-stripe ribbed collar. Premium washed cotton finish."},
  "b87e247c57761d8b8d0fb533": {"id": "b87e247c57761d8b8d0fb533", "name": "Alpine White Grand Prix Racing Polo", "price": 599, "originalPrice": 1299, "img": "assets/images/products/rs599_07.jpg", "cat": "tees", "sizes": ["S", "M", "L", "XL"], "rating": 5.0, "reviews": 167, "badge": "New Drop", "desc": "Sporty alpine white performance polo with motorsport chest badges, contrast tricolor racing side stripes, and collar piping."},
  "62c8b1a9c7b64ad3550797b0": {"id": "62c8b1a9c7b64ad3550797b0", "name": "Sunset Tangerine Contrast Stripe Polo", "price": 599, "originalPrice": 1099, "img": "assets/images/products/rs599_08.jpg", "cat": "tees", "sizes": ["S", "M", "L", "XL"], "rating": 4.7, "reviews": 142, "badge": "Popular", "desc": "Vibrant sunset orange polo with navy and white chest block stripes, contrast navy collar, and fine sleeve flag detail."},
  "81ded3293c61bb402ef33dfc": {"id": "81ded3293c61bb402ef33dfc", "name": "Vintage Ivory 1890 Mascot Graphic Polo", "price": 599, "originalPrice": 999, "img": "assets/images/products/rs599_09.jpg", "cat": "tees", "sizes": ["S", "M", "L", "XL", "XXL"], "rating": 4.8, "reviews": 78, "badge": "Vintage", "desc": "Off-white pique polo featuring classic collegiate mascot back print and 1890 heritage typography. Breathable combed cotton."},
  "a847db9cdac687870d380007": {"id": "a847db9cdac687870d380007", "name": "Blaze Coral Collar Graphic Polo", "price": 599, "originalPrice": 999, "img": "assets/images/products/rs599_10.jpg", "cat": "tees", "sizes": ["S", "M", "L", "XL"], "rating": 4.5, "reviews": 63, "badge": "Rs. 599 Deal", "desc": "Eye-catching blaze coral polo with contrast navy back-collar typography and racing shoulder piping. High-comfort pique weave."},
  "6cb582870a6d9f56cfd9d8f4": {"id": "6cb582870a6d9f56cfd9d8f4", "name": "Scarlet Red Star Crest Denim Polo", "price": 599, "originalPrice": 1099, "img": "assets/images/products/rs599_11.jpg", "cat": "tees", "sizes": ["S", "M", "L", "XL"], "rating": 4.8, "reviews": 114, "badge": "Hot", "desc": "Bold scarlet red polo with navy contrast collar and five-star roundel crest embroidery. Double-needle hem and sleeve cuffs."},
  "b44ff7efa0e06e473ad2dd4e": {"id": "b44ff7efa0e06e473ad2dd4e", "name": "Westchester Cup Tournament Navy Polo", "price": 599, "originalPrice": 1399, "img": "assets/images/products/rs599_12.jpg", "cat": "tees", "sizes": ["S", "M", "L", "XL", "XXL"], "rating": 5.0, "reviews": 288, "badge": "Exclusive", "desc": "Premium dark navy polo featuring elaborate Westchester Cup dual-horse and flag back embroidery. The quintessential polo classic."},
  "f2074e032b52124d457ed6e2": {"id": "f2074e032b52124d457ed6e2", "name": "Cadet Blue NYC Circular Crest Polo", "price": 599, "originalPrice": 999, "img": "assets/images/products/rs599_13.jpg", "cat": "tees", "sizes": ["S", "M", "L", "XL"], "rating": 4.6, "reviews": 82, "badge": "Trending", "desc": "Clean cadet blue polo with circular NYC chest typography and tricolor tab placket detail. Pre-shrunk cotton for long-lasting fit."},
  "a715ec173aafd1845ff79ec1": {"id": "a715ec173aafd1845ff79ec1", "name": "Espresso Brown Established Logo Polo", "price": 599, "originalPrice": 1199, "img": "assets/images/products/rs599_14.jpg", "cat": "tees", "sizes": ["S", "M", "L", "XL"], "rating": 4.7, "reviews": 91, "badge": "Rs. 599 Deal", "desc": "Understated espresso brown polo with clean horizontal logo embroidery and relaxed street fit. Premium 220 GSM pique fabric."}
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderStarIcons(rating) {
  const r = Math.min(5, Math.max(0, +rating || 4.5));
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (r >= i) {
      html += '<i class="fas fa-star"></i>';
    } else if (r >= i - 0.5) {
      html += '<i class="fas fa-star-half-alt"></i>';
    } else {
      html += '<i class="far fa-star"></i>';
    }
  }
  return html;
}

// ── DOM HELPERS ────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── PERSIST STATE ──────────────────────────
function saveCart() { localStorage.setItem('nsk_cart', JSON.stringify(state.cart)); }
function saveWishlist() { localStorage.setItem('nsk_wishlist', JSON.stringify(state.wishlist)); }

// ══════════════════════════════════════════
//  TOAST NOTIFICATIONS
// ══════════════════════════════════════════
function showToast(message, type = 'default', duration = 2800) {
  const container = $('#toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle';
  toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

// ══════════════════════════════════════════
//  HEADER SCROLL BEHAVIOR
// ══════════════════════════════════════════
function initHeaderScroll() {
  const header = $('#mainHeader');
  const backTop = $('#backToTop');
  const heroBg = $('#heroBg');
  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 10);
    backTop.classList.toggle('visible', y > 400);
    if (heroBg) heroBg.classList.toggle('zoomed', y < 100);
    lastY = y;
  }, { passive: true });

  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ══════════════════════════════════════════
//  TOP BAR CLOSE
// ══════════════════════════════════════════
function initTopBar() {
  const bar = $('#topBar');
  const closeBtn = $('#topBarClose');
  if (!bar || !closeBtn) return;
  closeBtn.addEventListener('click', () => {
    bar.style.transition = 'all 0.3s ease';
    bar.style.maxHeight = '0';
    bar.style.overflow = 'hidden';
    bar.style.padding = '0';
    setTimeout(() => bar.remove(), 300);
  });
}

// ══════════════════════════════════════════
//  MOBILE MENU
// ══════════════════════════════════════════
function initMobileMenu() {
  const hamburger = $('#hamburgerBtn');
  const menu      = $('#mobileMenu');
  const overlay   = $('#mobileMenuOverlay');
  const closeBtn  = $('#mobileMenuClose');

  function openMenu() {
    menu.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    menu.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);
}

// ══════════════════════════════════════════
//  CART LOGIC
// ══════════════════════════════════════════
function getCartTotal() {
  return state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}
function getCartCount() {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
  const count = getCartCount();
  const total = getCartTotal();
  $('#cartCount').textContent = count;
  $('#cartItemCount').textContent = count;
  $('#cartTotal').textContent = `₹${total.toLocaleString('en-IN')}`;

  const cartEmpty = $('#cartEmpty');
  const cartFooter = $('#cartFooter');
  const cartItems = $('#cartItems');

  if (count === 0) {
    cartEmpty.style.display = '';
    cartFooter.style.display = 'none';
    // Remove all items except empty message
    $$('.cart-item', cartItems).forEach(el => el.remove());
  } else {
    cartEmpty.style.display = 'none';
    cartFooter.style.display = '';
    renderCartItems();
  }
  saveCart();
}

function renderCartItems() {
  const cartItems = $('#cartItems');
  if (!cartItems) return;
  // Remove existing cart item elements
  $$('.cart-item', cartItems).forEach(el => el.remove());

  state.cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${escapeHtml(item.img || 'assets/images/logo.jpeg')}" alt="${escapeHtml(item.name)}" onerror="this.onerror=null;this.src='assets/images/logo.jpeg';" />
      <div class="cart-item-details">
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        <div class="cart-item-meta">Size: ${escapeHtml(item.size || 'M')} | ₹${(item.price || 0).toLocaleString('en-IN')}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-id="${escapeHtml(item.id)}" data-size="${escapeHtml(item.size || 'M')}" data-action="dec" aria-label="Decrease quantity">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-id="${escapeHtml(item.id)}" data-size="${escapeHtml(item.size || 'M')}" data-action="inc" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${escapeHtml(item.id)}" data-size="${escapeHtml(item.size || 'M')}" aria-label="Remove item"><i class="fas fa-trash-alt"></i></button>
    `;
    cartItems.appendChild(el);
  });

  // Qty buttons
  $$('.qty-btn', cartItems).forEach(btn => {
    btn.addEventListener('click', () => {
      const id = String(btn.dataset.id);
      const size = btn.dataset.size;
      const action = btn.dataset.action;
      const item = state.cart.find(i => String(i.id) === id && (!size || i.size === size));
      if (!item) return;
      if (action === 'inc') {
        item.qty++;
      } else if (action === 'dec') {
        item.qty--;
        if (item.qty <= 0) {
          state.cart = state.cart.filter(i => !(String(i.id) === id && (!size || i.size === size)));
        }
      }
      updateCartUI();
    });
  });

  // Remove buttons
  $$('.cart-item-remove', cartItems).forEach(btn => {
    btn.addEventListener('click', () => {
      const id = String(btn.dataset.id);
      const size = btn.dataset.size;
      state.cart = state.cart.filter(i => !(String(i.id) === id && (!size || i.size === size)));
      updateCartUI();
      showToast('Item removed from cart', 'error');
    });
  });
}

function addToCart(id, name, price, img, size = 'M') {
  const itemId = String(id);
  const numPrice = typeof price === 'string' ? parseInt(price.replace(/,/g, ''), 10) : (+price || 0);
  const existing = state.cart.find(i => String(i.id) === itemId && i.size === size);
  if (existing) {
    existing.qty++;
    showToast(`${name} quantity updated!`, 'success');
  } else {
    state.cart.push({ id: itemId, name, price: numPrice, img: img || 'assets/images/logo.jpeg', size, qty: 1 });
    showToast(`${name} added to cart! 🛍️`, 'success');
  }
  updateCartUI();
  // Animate cart icon
  const cartBtn = $('#cartBtn');
  if (cartBtn) {
    cartBtn.style.transform = 'scale(1.3)';
    setTimeout(() => { cartBtn.style.transform = ''; }, 300);
  }
}

function initCart() {
  const cartBtn     = $('#cartBtn');
  const cartClose   = $('#cartClose');
  const cartOverlay = $('#cartOverlay');
  const cartDrawer  = $('#cartDrawer');

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtn?.addEventListener('click', e => { e.preventDefault(); openCart(); });
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  // Delegated Add to Cart on entire document for static and dynamic cards
  document.addEventListener('click', e => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;
    e.stopPropagation();
    const { id, name, price, img } = btn.dataset;
    const card = btn.closest('.product-card');
    const selectedSize = card?.querySelector('.size-chip.selected')?.textContent || 'M';
    addToCart(id, name, price, img, selectedSize);
  });

  updateCartUI();
}

// ══════════════════════════════════════════
//  WISHLIST LOGIC
// ══════════════════════════════════════════
function updateWishlistUI() {
  const count = state.wishlist.length;
  const wc = $('#wishlistCount');
  if (count > 0) {
    wc.textContent = count;
    wc.classList.add('show');
  } else {
    wc.classList.remove('show');
  }
  saveWishlist();

  // Update heart icons
  $$('.wishlist-toggle').forEach(btn => {
    const id = String(btn.dataset.id);
    const inList = state.wishlist.some(x => String(x) === id);
    btn.innerHTML = inList ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
    btn.classList.toggle('wishlisted', inList);
    btn.style.color = inList ? 'var(--danger)' : '';
  });
}

function initWishlist() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.wishlist-toggle');
    if (!btn) return;
    const id = String(btn.dataset.id);
    const prod = products[id];
    const prodName = prod ? prod.name : 'Product';
    if (state.wishlist.some(x => String(x) === id)) {
      state.wishlist = state.wishlist.filter(x => String(x) !== id);
      showToast(`Removed from wishlist`, 'error');
    } else {
      state.wishlist.push(id);
      showToast(`${prodName} added to wishlist ❤️`, 'success');
    }
    updateWishlistUI();
  });
  updateWishlistUI();
}

// ══════════════════════════════════════════
//  QUICK VIEW MODAL
// ══════════════════════════════════════════
async function openQuickView(id) {
  const prodId = String(id);
  let prod = products[prodId];
  if (!prod) {
    try {
      const res = await fetch(`${API_BASE}/api/products/${prodId}`);
      if (res.ok) {
        const p = await res.json();
        prod = {
          id: String(p._id),
          name: p.name || 'Product',
          price: Number(p.price) || 0,
          originalPrice: Number(p.originalPrice) || 0,
          img: p.image || 'assets/images/logo.jpeg',
          cat: p.category || 'tees',
          sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ['S', 'M', 'L', 'XL'],
          rating: Number(p.rating) || 4.5,
          reviews: Number(p.numReviews) || 0,
          desc: p.description || '',
          inStock: p.inStock !== false
        };
        products[prodId] = prod;
      }
    } catch (_) {}
  }
  if (!prod) return;

  const stars = renderStarIcons(prod.rating || 4.5);

  $('#modalInner').innerHTML = `
    <img class="modal-img" src="${prod.img || 'assets/images/logo.jpeg'}" alt="${escapeHtml(prod.name)}" onerror="this.onerror=null;this.src='assets/images/logo.jpeg';" />
    <div class="modal-details">
      <div class="product-brand">NSK APPAREL</div>
      <div class="product-name">${escapeHtml(prod.name)}</div>
      <div class="product-rating">
        <div class="stars" style="font-size:16px;color:var(--gold);">${stars}</div>
        <span class="rating-count">${prod.reviews > 0 ? `(${prod.reviews} reviews)` : '(New Drop)'}</span>
      </div>
      <div class="product-price">
        <span class="price-current" style="font-size:26px;">₹${(+prod.price).toLocaleString('en-IN')}</span>
        ${prod.originalPrice ? `<span class="price-original" style="font-size:18px;margin-left:8px;color:var(--grey-400);text-decoration:line-through;">₹${(+prod.originalPrice).toLocaleString('en-IN')}</span>` : ''}
      </div>
      <p style="font-size:14px;color:var(--grey-600);line-height:1.7;margin:16px 0;">${escapeHtml(prod.desc || 'Premium streetwear engineered for comfort and style.')}</p>
      <div class="modal-size-label">Select Size:</div>
      <div class="modal-sizes" id="modalSizes">
        ${(prod.sizes && prod.sizes.length ? prod.sizes : ['S','M','L','XL']).map((s, i) => `<span class="size-chip${i === 1 ? ' selected' : ''}" data-size="${s}">${s}</span>`).join('')}
      </div>
      <button class="btn btn-navy" style="width:100%;justify-content:center;height:52px;font-size:15px;border-radius:999px;" id="modalCartBtn" data-id="${prod.id}" data-name="${escapeHtml(prod.name)}" data-price="${prod.price}" data-img="${prod.img || 'assets/images/logo.jpeg'}">
        <i class="fas fa-shopping-bag"></i> ${prod.inStock === false ? 'Out of Stock' : 'Add to Cart'}
      </button>
      <div style="display:flex;gap:12px;margin-top:12px;">
        <button class="btn btn-outline-navy" style="flex:1;justify-content:center;height:44px;border-radius:999px;font-size:13px;" id="modalWishBtn" data-id="${prod.id}">
          <i class="far fa-heart"></i> Wishlist
        </button>
        <button class="btn btn-outline-navy" style="flex:1;justify-content:center;height:44px;border-radius:999px;font-size:13px;" id="modalShareBtn">
          <i class="fas fa-share-alt"></i> Share
        </button>
      </div>
    </div>
  `;

  // Size chip selection
  $$('.size-chip', $('#modalSizes')).forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.size-chip', $('#modalSizes')).forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });

  // Cart button
  $('#modalCartBtn')?.addEventListener('click', () => {
    const selectedSize = $('#modalSizes .size-chip.selected')?.textContent || 'M';
    addToCart(prod.id, prod.name, prod.price, prod.img, selectedSize);
    closeQuickView();
  });

  // Wishlist button
  $('#modalWishBtn')?.addEventListener('click', () => {
    const pId = String(prod.id);
    if (state.wishlist.some(x => String(x) === pId)) {
      state.wishlist = state.wishlist.filter(i => String(i) !== pId);
      showToast('Removed from wishlist', 'error');
    } else {
      state.wishlist.push(pId);
      showToast(`${prod.name} added to wishlist ❤️`, 'success');
    }
    updateWishlistUI();
  });

  // Share button
  $('#modalShareBtn')?.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: prod.name, text: `Check out ${prod.name} on NSK APPAREL`, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Product link copied to clipboard! 📋', 'success');
    }
  });

  $('#modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  $('#modalOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function initQuickView() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.quick-view-btn');
    if (!btn) return;
    openQuickView(btn.dataset.id);
  });
  $('#modalClose')?.addEventListener('click', closeQuickView);
  $('#modalOverlay')?.addEventListener('click', e => {
    if (e.target === $('#modalOverlay')) closeQuickView();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeQuickView();
  });
}

// ══════════════════════════════════════════
//  DYNAMIC PRODUCTS & LIVE SYNC
// ══════════════════════════════════════════
function renderDynamicProductsGrid(items) {
  const grid = $('#productsGrid');
  if (!grid || !Array.isArray(items) || items.length === 0) return;

  grid.innerHTML = items.map((p, idx) => {
    const id = String(p._id);
    const priceNum = Number(p.price) || 0;
    const origPriceNum = Number(p.originalPrice) || 0;
    const cat = escapeHtml(p.category || 'tees');
    const name = escapeHtml(p.name || 'Product');
    const img = escapeHtml(p.image || 'assets/images/logo.jpeg');
    const rating = Math.min(5, Math.max(0, Number(p.rating) || 4.5));
    const reviews = Number(p.numReviews) || Math.floor(Math.random() * 80) + 40;
    const discountPct = origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : 0;
    const badgeText = p.badge ? escapeHtml(p.badge) : (p.featured ? 'Featured' : (idx === 0 ? 'New' : ''));
    const badgeClass = badgeText.toLowerCase() === 'sale' ? 'badge-sale' : (badgeText.toLowerCase() === 'hot' ? 'badge-hot' : 'badge-new');
    const sizes = Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ['S', 'M', 'L', 'XL'];
    const delayClass = idx % 4 !== 0 ? ` reveal-delay-${idx % 4}` : '';

    return `
      <div class="product-card reveal${delayClass} visible" data-category="${cat}" id="prod-${id}">
        <div class="product-img-wrap">
          <img src="${img}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='assets/images/logo.jpeg';" />
          ${badgeText ? `<div class="product-badges"><span class="badge ${badgeClass}">${badgeText}</span></div>` : ''}
          <div class="product-actions">
            <button class="product-action-btn wishlist-toggle" data-id="${id}" aria-label="Add to wishlist"><i class="far fa-heart"></i></button>
            <button class="product-action-btn quick-view-btn" data-id="${id}" aria-label="Quick view"><i class="far fa-eye"></i></button>
          </div>
          <button class="product-add-to-cart add-to-cart-btn" data-id="${id}" data-name="${name}" data-price="${priceNum}" data-img="${img}">
            <i class="fas fa-shopping-bag"></i> Add to Cart
          </button>
        </div>
        <div class="product-info">
          <div class="product-brand">NSK APPAREL</div>
          <div class="product-name">${name}</div>
          <div class="product-rating">
            <div class="stars">
              ${renderStarIcons(rating)}
            </div>
            <span class="rating-count">(${reviews})</span>
          </div>
          <div class="product-price">
            <span class="price-current">₹${priceNum.toLocaleString('en-IN')}</span>
            ${origPriceNum > priceNum ? `<span class="price-original">₹${origPriceNum.toLocaleString('en-IN')}</span>` : ''}
            ${discountPct > 0 ? `<span class="price-discount">${discountPct}% OFF</span>` : ''}
          </div>
          ${sizes.length ? `
            <div class="product-sizes">
              ${sizes.map((s, sIdx) => `<span class="size-chip${sIdx === 0 ? ' selected' : ''}">${escapeHtml(s)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  applyFilterTab();
  updateWishlistUI();
}

function updateCategoryCounts() {
  const counts = { tees: 0, hoodies: 0, caps: 0, bottoms: 0 };
  Object.values(products).forEach(p => {
    const c = (p.cat || '').toLowerCase();
    if (counts[c] !== undefined) counts[c]++;
    else counts[c] = (counts[c] || 0) + 1;
  });

  const catMap = {
    'catTees': counts.tees,
    'catHoodies': counts.hoodies,
    'catCaps': counts.caps,
    'catBottoms': counts.bottoms
  };

  Object.entries(catMap).forEach(([id, cnt]) => {
    const el = $(`#${id} .cat-card-count`);
    if (el) el.textContent = `${cnt || 0} Products`;
  });
}

async function loadDynamicProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) return;
    const dbProducts = await res.json();
    if (!Array.isArray(dbProducts) || dbProducts.length === 0) return;

    const newProducts = {};
    dbProducts.forEach(p => {
      const id = String(p._id);
      newProducts[id] = {
        id: id,
        name: p.name || 'Product',
        price: Number(p.price) || 0,
        originalPrice: Number(p.originalPrice) || 0,
        img: p.image || 'assets/images/logo.jpeg',
        cat: p.category || 'tees',
        sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ['S', 'M', 'L', 'XL'],
        rating: Number(p.rating) || 4.5,
        reviews: Number(p.numReviews) || 0,
        desc: p.description || '',
        badge: p.badge || (p.featured ? 'Featured' : ''),
        inStock: p.inStock !== false
      };
    });

    products = newProducts;
    renderDynamicProductsGrid(dbProducts);
    updateCategoryCounts();
  } catch (err) {
    console.warn('Could not load products from API:', err);
  }
}

function applyFilterTab() {
  const activeTab = $('#filterTabs .filter-tab.active');
  const filter = activeTab ? activeTab.dataset.filter : 'all';
  const cards = $$('#productsGrid .product-card');
  cards.forEach(card => {
    if (filter === 'all' || card.dataset.category === filter) {
      card.style.display = '';
      setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 10);
    } else {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      setTimeout(() => { card.style.display = 'none'; }, 300);
    }
  });
}

// ══════════════════════════════════════════
//  PRODUCT FILTER TABS
// ══════════════════════════════════════════
function initFilterTabs() {
  const tabs = $$('#filterTabs .filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      applyFilterTab();
    });
  });
}

// ══════════════════════════════════════════
//  CATEGORY CARDS
// ══════════════════════════════════════════
function initCategoryCards() {
  $$('.cat-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      const tab = $(`#filterTabs [data-filter="${cat}"]`);
      if (tab) {
        tab.click();
        const sec = $('#products');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    // Keyboard accessibility
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });
}

// ══════════════════════════════════════════
//  SIZE CHIP SELECTION
// ══════════════════════════════════════════
function initSizeChips() {
  document.addEventListener('click', e => {
    const chip = e.target.closest('.product-card .size-chip');
    if (!chip) return;
    e.stopPropagation();
    const card = chip.closest('.product-card');
    $$('.size-chip', card).forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
  });
}

// ══════════════════════════════════════════
//  SCROLL REVEAL ANIMATIONS
// ══════════════════════════════════════════
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => observer.observe(el));
}

// ══════════════════════════════════════════
//  SEARCH FUNCTIONALITY
// ══════════════════════════════════════════
function initSearch() {
  const input = $('#searchInput');
  const dropdown = $('#searchDropdown');
  if (!input || !dropdown) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { dropdown.classList.remove('visible'); return; }

    const results = Object.values(products).filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) || (p.cat && p.cat.toLowerCase().includes(q))
    ).slice(0, 5);

    if (results.length === 0) {
      dropdown.innerHTML = `<div style="padding:16px;color:var(--grey-400);text-align:center;font-size:14px;">No products found for "${escapeHtml(q)}"</div>`;
    } else {
      dropdown.innerHTML = results.map(p => `
        <div class="search-result-item" data-id="${escapeHtml(p.id)}">
          <img src="${escapeHtml(p.img || 'assets/images/logo.jpeg')}" alt="${escapeHtml(p.name)}" onerror="this.onerror=null;this.src='assets/images/logo.jpeg';" />
          <div>
            <div class="search-result-name">${escapeHtml(p.name)}</div>
            <div class="search-result-price">₹${(Number(p.price) || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>
      `).join('');

      $$('.search-result-item', dropdown).forEach(item => {
        item.addEventListener('click', () => {
          openQuickView(item.dataset.id);
          input.value = '';
          dropdown.classList.remove('visible');
        });
      });
    }
    dropdown.classList.add('visible');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#headerSearch')) dropdown.classList.remove('visible');
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { dropdown.classList.remove('visible'); input.blur(); }
  });
}

// ══════════════════════════════════════════
//  NEWSLETTER FORM
// ══════════════════════════════════════════
function initNewsletter() {
  const form = $('#newsletterForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#newsletterEmail').value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    showToast(`🎉 You're subscribed! Check your inbox for your 15% discount code.`, 'success', 4000);
    form.reset();
  });
}

// ══════════════════════════════════════════
//  LOAD MORE BUTTON
// ══════════════════════════════════════════
function initLoadMore() {
  const btn = $('#loadMoreBtn');
  if (!btn) return;
  btn.addEventListener('click', e => {
    e.preventDefault();
    showToast('All products are displayed. More dropping soon! 🔥', 'default', 3000);
  });
}

// ══════════════════════════════════════════
//  NAV LINK SMOOTH SCROLL
// ══════════════════════════════════════════
function initNavLinks() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#' || href.length <= 1) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        $('#mobileMenu')?.classList.remove('open');
        $('#mobileMenuOverlay')?.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });
}

// ══════════════════════════════════════════
//  ACTIVE NAV HIGHLIGHT ON SCROLL
// ══════════════════════════════════════════
function initActiveNav() {
  const sections = [
    { id: 'hero',         nav: '#navHome' },
    { id: 'products',     nav: '#navMen'  },
    { id: 'new-arrivals', nav: '#navNew'  },
    { id: 'categories',   nav: '#navCat'  },
  ];

  window.addEventListener('scroll', () => {
    const y = window.scrollY + 100;
    sections.forEach(({ id, nav }) => {
      const sec = document.getElementById(id);
      const link = document.querySelector(nav);
      if (!sec || !link) return;
      if (y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight) {
        $$('.main-nav a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

// ══════════════════════════════════════════
//  HERO ZOOM ON LOAD
// ══════════════════════════════════════════
function initHeroZoom() {
  const heroBg = $('#heroBg');
  if (!heroBg) return;
  setTimeout(() => { heroBg.classList.add('zoomed'); }, 200);
}

// ══════════════════════════════════════════
//  PRODUCT CARD HOVER EFFECT
// ══════════════════════════════════════════
function initCardEffects() {
  $$('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.zIndex = '10';
    });
    card.addEventListener('mouseleave', () => {
      setTimeout(() => { card.style.zIndex = ''; }, 350);
    });
  });
}

// ══════════════════════════════════════════
//  SHARE BUTTON
// ══════════════════════════════════════════
function initShare() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-share]');
    if (!btn) return;
    if (navigator.share) {
      navigator.share({ title: 'NSK APPAREL', url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  });
}

// ══════════════════════════════════════════
//  INIT ALL
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  initTopBar();
  initHeaderScroll();
  initMobileMenu();
  initCart();
  initWishlist();
  initQuickView();
  initFilterTabs();
  initCategoryCards();
  initSizeChips();
  initReveal();
  initSearch();
  initNewsletter();
  initLoadMore();
  initNavLinks();
  initActiveNav();
  initHeroZoom();
  initCardEffects();
  initShare();

  // Load dynamic products from backend database
  await loadDynamicProducts();

  // Trigger initial reveal check
  $$('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) el.classList.add('visible');
  });

  // Init auth system
  initAuthSystem();

  console.log('%c NSK APPAREL 🛍️ Website Loaded ', 'background:#0D1B2A;color:#C9A84C;font-size:14px;font-weight:bold;padding:8px 16px;border-radius:4px;');
});

/* ═══════════════════════════════════════════════════════════════
   NSK APPAREL — AUTH + CHECKOUT + ORDERS MODULE
   ═══════════════════════════════════════════════════════════════ */

// ── API Helper ─────────────────────────────────────────

async function nskFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    throw new Error('Cannot connect to backend server! Please make sure "npm start" is running in terminal (http://localhost:3000)');
  }
  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error(`Server returned status ${res.status}. Make sure backend is running.`);
  }
  if (!res.ok) {
    if (res.status === 401 && auth.token) {
      userLogout();
      throw new Error('Session expired. Please login again.');
    }
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

// ── Auth State ────────────────────────────────────────────────────
const auth = {
  token: localStorage.getItem('nsk_user_token'),
  user:  JSON.parse(localStorage.getItem('nsk_user_data') || 'null'),
};

function saveAuth(token, user) {
  auth.token = token;
  auth.user  = user;
  localStorage.setItem('nsk_user_token', token);
  localStorage.setItem('nsk_user_data',  JSON.stringify(user));
}

function clearAuth() {
  auth.token = null;
  auth.user  = null;
  localStorage.removeItem('nsk_user_token');
  localStorage.removeItem('nsk_user_data');
  localStorage.removeItem('nsk_admin_token');
}

// ── Init ──────────────────────────────────────────────────────────
function initAuthSystem() {
  updateAuthUI();

  // Close user dropdown on outside click
  document.addEventListener('click', e => {
    const dropdown = $('#userDropdown');
    const btn      = $('#userAuthBtn');
    if (dropdown && !dropdown.contains(e.target) && !btn?.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });

  // Enter key on login password & email
  document.getElementById('loginPassword')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') userLogin();
  });
  document.getElementById('loginEmail')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') userLogin();
  });
  document.getElementById('regPassword')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') userRegister();
  });

  // Handle direct navigation to admin: /?admin_login=1
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('admin_login')) {
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);

    if (auth.user?.isAdmin && (auth.token || localStorage.getItem('nsk_admin_token'))) {
      window.location.href = '/admin';
      return;
    }

    setTimeout(() => {
      openAuthModal('login');
      const emailInput = document.getElementById('loginEmail');
      if (emailInput) {
        emailInput.value = 'apparelnsk@gmail.com';
      }
      const passInput = document.getElementById('loginPassword');
      if (passInput) {
        passInput.focus();
      }
      showAuthError('loginError', '🔒 Admin access required. Please enter your password to sign in as Admin.');
    }, 200);
  }
}

// ── Update header UI based on login state ─────────────────────────
function updateAuthUI() {
  const btn  = $('#userAuthBtn');
  const icon = $('#userAuthIcon');
  if (!btn || !icon) return;

  const adminLink = $('#adminDropdownLink');

  if (auth.user) {
    if (auth.user.isAdmin) {
      icon.className = 'fas fa-crown';
      btn.style.color = 'var(--gold)';
      btn.title = `👑 NSK Admin (Logged in)`;
    } else {
      icon.className = 'fas fa-user-check';
      btn.style.color = '';
      btn.title = `Hi, ${auth.user.name}`;
    }
    btn.classList.add('logged-in');

    const dn = $('#dropdownName');
    if (dn) {
      dn.innerHTML = auth.user.isAdmin
        ? `<span style="color:var(--gold);font-weight:700;">👑 NSK Admin</span> <span style="background:var(--gold);color:#000;font-size:10px;font-weight:800;padding:2px 6px;border-radius:4px;margin-left:4px;">ADMIN</span>`
        : auth.user.name;
    }
    if (adminLink) adminLink.style.display = auth.user.isAdmin ? 'flex' : 'none';
  } else {
    icon.className = 'far fa-user';
    btn.style.color = '';
    btn.classList.remove('logged-in');
    btn.title = 'Login / Register';
    if (adminLink) adminLink.style.display = 'none';
  }
}

// ── Header user button click ──────────────────────────────────────
function handleAuthBtnClick() {
  if (auth.user) {
    // Toggle dropdown
    const dd = $('#userDropdown');
    if (dd) dd.classList.toggle('open');
  } else {
    openAuthModal('login');
  }
}

// ── Open / Close Auth Modal ───────────────────────────────────────
function openAuthModal(tab = 'login') {
  $('#authOverlay').classList.add('open');
  $('#authModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  switchAuthTab(tab);
}

function closeAuthModal(e) {
  if (e && e.target !== $('#authOverlay')) return;
  $('#authOverlay').classList.remove('open');
  $('#authModal').classList.remove('open');
  document.body.style.overflow = '';
}

function switchAuthTab(tab) {
  const loginForm    = $('#authLoginForm');
  const registerForm = $('#authRegisterForm');
  const tabLogin     = $('#tabLogin');
  const tabRegister  = $('#tabRegister');

  if (tab === 'login') {
    loginForm.style.display    = '';
    registerForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    clearAuthErrors();
  } else {
    loginForm.style.display    = 'none';
    registerForm.style.display = '';
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    clearAuthErrors();
  }
}

function clearAuthErrors() {
  $$('.auth-error').forEach(el => { el.classList.remove('show'); el.textContent = ''; });
}

function togglePassVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    if (icon) icon.className = 'fas fa-eye';
  }
}

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add('show'); }
}

// ── USER LOGIN ────────────────────────────────────────────────────
async function userLogin() {
  const email    = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  const btn      = document.getElementById('loginBtn');

  clearAuthErrors();
  if (!email || !password) { showAuthError('loginError', 'Please fill in both email and password'); return; }

  const cleanEmail = email.toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleanEmail)) {
    showAuthError('loginError', 'Please enter a valid email format (e.g. name@gmail.com)');
    document.getElementById('loginEmail')?.focus();
    return;
  }

  btn.disabled  = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

  try {
    const data = await nskFetch('/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: cleanEmail, password }),
    });

    saveAuth(data.token, data.user);
    if (data.isAdmin || data.user?.isAdmin) {
      localStorage.setItem('nsk_admin_token', data.token);
    }
    updateAuthUI();
    closeAuthModal();

    if (data.isAdmin || data.user?.isAdmin) {
      showToast('👑 Welcome Admin! Opening Admin Panel...', 'success');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 900);
      return;
    }

    showToast(`Welcome back, ${data.user.name}! 👋`, 'success');
  } catch (err) {
    showAuthError('loginError', err.message);
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
  }
}

// ── USER REGISTER ─────────────────────────────────────────────────
async function userRegister() {
  const name     = document.getElementById('regName')?.value.trim();
  const phone    = document.getElementById('regPhone')?.value.trim();
  const email    = document.getElementById('regEmail')?.value.trim();
  const password = document.getElementById('regPassword')?.value;
  const btn      = document.getElementById('registerBtn');

  clearAuthErrors();

  if (!name || !phone || !email || !password) {
    showAuthError('registerError', 'All fields are required');
    return;
  }

  // 1. Strict Name validation (Must be letters, between 2 and 50 chars)
  const cleanName = name.replace(/\s+/g, ' ');
  if (cleanName.length < 2 || cleanName.length > 50) {
    showAuthError('registerError', 'Please enter your full name (2 to 50 characters)');
    document.getElementById('regName')?.focus();
    return;
  }
  if (!/^[A-Za-z\s.'-]{2,50}$/.test(cleanName) || !/[A-Za-z]{2,}/.test(cleanName)) {
    showAuthError('registerError', 'Full name can only contain letters (no numbers or special characters)');
    document.getElementById('regName')?.focus();
    return;
  }
  if (/^([A-Za-z])\1{3,}$/i.test(cleanName)) {
    showAuthError('registerError', 'Please enter your real full name');
    document.getElementById('regName')?.focus();
    return;
  }

  // 2. Strict Phone number validation (Must be real 10-digit mobile)
  let cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) cleanPhone = cleanPhone.slice(2);
  if (cleanPhone.startsWith('0') && cleanPhone.length === 11) cleanPhone = cleanPhone.slice(1);
  if (!/^\d{10}$/.test(cleanPhone)) {
    showAuthError('registerError', 'Please enter a valid 10-digit mobile number');
    document.getElementById('regPhone')?.focus();
    return;
  }
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    showAuthError('registerError', 'Mobile number must start with 6, 7, 8, or 9');
    document.getElementById('regPhone')?.focus();
    return;
  }
  if (/^(\d)\1{7,}$/.test(cleanPhone) || cleanPhone === '1234567890') {
    showAuthError('registerError', 'Please enter a real, active mobile phone number');
    document.getElementById('regPhone')?.focus();
    return;
  }

  // 3. Strict Real Email validation (Syntax + domain check)
  const cleanEmail = email.toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleanEmail)) {
    showAuthError('registerError', 'Please enter a valid email format (e.g. name@gmail.com)');
    document.getElementById('regEmail')?.focus();
    return;
  }
  const emailDomain = cleanEmail.split('@')[1];
  const tld = emailDomain?.split('.').pop();
  if (!tld || tld.length < 2) {
    showAuthError('registerError', 'Email domain extension (.com, .in, etc.) is invalid');
    document.getElementById('regEmail')?.focus();
    return;
  }
  const commonTypos = {
    'gmial.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com'
  };
  if (commonTypos[emailDomain]) {
    showAuthError('registerError', `Did you mean ${cleanEmail.split('@')[0]}@${commonTypos[emailDomain]}?`);
    document.getElementById('regEmail')?.focus();
    return;
  }

  // 4. Password validation
  if (!password || password.trim().length < 6) {
    showAuthError('registerError', 'Password must be at least 6 characters long');
    document.getElementById('regPassword')?.focus();
    return;
  }

  btn.disabled  = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

  try {
    const data = await nskFetch('/api/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: cleanName, phone: cleanPhone, email: cleanEmail, password }),
    });

    saveAuth(data.token, data.user);
    updateAuthUI();
    closeAuthModal();
    showToast(`Welcome to NSK APPAREL, ${data.user.name}! 🎉`, 'success');
  } catch (err) {
    showAuthError('registerError', err.message);
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
  }
}

// ── USER LOGOUT ───────────────────────────────────────────────────
function userLogout() {
  clearAuth();
  updateAuthUI();
  $('#userDropdown')?.classList.remove('open');
  showToast('Logged out successfully', 'default');
}

// ── Indian States & Major Districts Directory ─────────────────────
const INDIA_STATES_CITIES = {
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Dindigul", "Thanjavur", "Sivakasi", "Virudhunagar", "Karur", "Udhagamandalam (Ooty)", "Hosur", "Nagercoil", "Kanchipuram", "Kumbakonam", "Tiruvannamalai", "Cuddalore", "Villupuram", "Nagapattinam", "Namakkal", "Pudukkottai", "Theni", "Ramanathapuram"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Pimpri-Chinchwad", "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai", "Solapur", "Mira-Bhayandar", "Bhiwandi", "Amravati", "Nanded", "Kolhapur", "Akola", "Ulhasnagar", "Sangli", "Malegaon", "Jalgaon", "Latur", "Dhule", "Ahmednagar", "Chandrapur", "Parbhani", "Satara"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Davanagere", "Ballari", "Vijayapura", "Shivamogga", "Tumakuru", "Raichur", "Bidar", "Hosapete", "Gadag-Betageri", "Udupi", "Kolar", "Mandya", "Hassan"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Kannur", "Alappuzha", "Kottayam", "Palakkad", "Malappuram", "Kasaragod", "Pathanamthitta", "Idukki", "Wayanad"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada", "Rajahmundry", "Tirupati", "Kadapa", "Anantapur", "Vizianagaram", "Eluru", "Ongole", "Nandyal", "Machilipatnam"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Miryalaguda", "Siddipet"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Navsari", "Morbi", "Nadiad", "Surendranagar", "Bharuch", "Vapi"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar", "Pali", "Sri Ganganagar", "Barmer", "Chittorgarh"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj", "Ghaziabad", "Noida", "Meerut", "Aligarh", "Bareilly", "Moradabad", "Gorakhpur", "Saharanpur", "Jhansi", "Muzaffarnagar", "Mathura", "Ayodhya"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Kharagpur", "Habra", "Shantipur", "Dankuni", "Haldia"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Moga", "Abohar", "Phagwara"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Bhiwani", "Sirsa", "Bahadurgarh"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Katni", "Singrauli"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Nainital"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Manali", "Baddi", "Nahan", "Hamirpur", "Una"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro", "Hazaribagh", "Giridih", "Ramgarh"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Raigarh", "Jagdalpur", "Ambikapur"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Udhampur", "Sopore"],
  "Puducherry": ["Puducherry", "Karaikal", "Ozhukarai", "Mahe", "Yanam"],
  "Chandigarh": ["Chandigarh"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailashahar"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang"],
  "Ladakh": ["Leh", "Kargil"],
  "Andaman and Nicobar Islands": ["Port Blair"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Andrott"]
};

function populateStateDropdown(selectedState = '', selectedCity = '') {
  const stateSelect = document.getElementById('coState');
  if (!stateSelect) return;
  const states = Object.keys(INDIA_STATES_CITIES).sort();
  stateSelect.innerHTML = '<option value="">Select State / UT</option>' +
    states.map(s => `<option value="${s}" ${s === selectedState ? 'selected' : ''}>${s}</option>`).join('');
  if (selectedState) onStateChange(selectedState, selectedCity);
}

function onStateChange(selectedState, selectedCity = '') {
  const citySelect = document.getElementById('coCity');
  if (!citySelect) return;
  if (!selectedState || !INDIA_STATES_CITIES[selectedState]) {
    citySelect.innerHTML = '<option value="">Select State First</option>';
    return;
  }
  const cities = INDIA_STATES_CITIES[selectedState];
  let optionsHtml = '<option value="">Select City / District</option>';
  if (selectedCity && !cities.includes(selectedCity)) {
    optionsHtml += `<option value="${selectedCity}" selected>${selectedCity}</option>`;
  }
  optionsHtml += cities.map(c => `<option value="${c}" ${c === selectedCity ? 'selected' : ''}>${c}</option>`).join('');
  citySelect.innerHTML = optionsHtml;
}

let pincodeLookupTimer = null;
async function onPincodeInput(val) {
  const statusEl = document.getElementById('coPincodeStatus');
  const clean = val.replace(/\D/g, '').slice(0, 6);
  document.getElementById('coPincode').value = clean;

  if (!statusEl) return;

  if (clean.length < 6) {
    statusEl.className = 'pincode-status';
    statusEl.innerHTML = '';
    return;
  }

  if (clean.startsWith('0')) {
    statusEl.className = 'pincode-status error show';
    statusEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Indian PIN codes cannot start with 0';
    return;
  }

  clearTimeout(pincodeLookupTimer);
  statusEl.className = 'pincode-status loading show';
  statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking postal circle with India Post...';

  pincodeLookupTimer = setTimeout(async () => {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
      const data = await res.json();
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
        const poList = data[0].PostOffice;
        const stateName = poList[0].State;
        const district = poList[0].District;

        // Auto-match state in dropdown
        const matchedState = Object.keys(INDIA_STATES_CITIES).find(s => s.toLowerCase() === stateName.toLowerCase()) || stateName;
        populateStateDropdown(matchedState, district);

        // Populate city with local post offices / district
        const citySelect = document.getElementById('coCity');
        if (citySelect) {
          const uniqueLocals = [...new Set([district, ...poList.map(p => p.Name)])];
          citySelect.innerHTML = '<option value="">Select City / Post Office Area</option>' +
            uniqueLocals.map(l => `<option value="${l}" ${l === district ? 'selected' : ''}>${l}</option>`).join('');
        }

        statusEl.className = 'pincode-status success show';
        statusEl.innerHTML = `<i class="fas fa-check-circle"></i> Verified: <strong>${district}, ${matchedState}</strong>`;
      } else {
        statusEl.className = 'pincode-status error show';
        statusEl.innerHTML = '<i class="fas fa-times-circle"></i> Invalid PIN code. Please enter a valid 6-digit Indian PIN.';
      }
    } catch (e) {
      statusEl.className = 'pincode-status success show';
      statusEl.innerHTML = `<i class="fas fa-check"></i> 6-digit PIN accepted`;
    }
  }, 350);
}

// ── CHECKOUT ──────────────────────────────────────────────────────
function openCheckout() {
  // Must be logged in
  if (!auth.user) {
    closeCart();
    showToast('Please login to checkout', 'error');
    setTimeout(() => openAuthModal('login'), 400);
    return;
  }

  // Cart must not be empty
  if (!state.cart.length) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  // Close cart drawer
  const cartDrawer  = $('#cartDrawer');
  const cartOverlay = $('#cartOverlay');
  cartDrawer?.classList.remove('open');
  cartOverlay?.classList.remove('open');

  // Fill customer card
  const cardName = document.getElementById('checkoutUserName');
  const cardContact = document.getElementById('checkoutUserContact');
  const cardAvatar = document.getElementById('checkoutUserAvatar');
  if (cardName && auth.user) {
    cardName.textContent = auth.user.name;
    cardAvatar.textContent = auth.user.name.charAt(0).toUpperCase();
    cardContact.textContent = `📞 ${auth.user.phone}  |  ✉️ ${auth.user.email}`;
  }

  // Initialize State dropdown
  populateStateDropdown(auth.user?.state || '', auth.user?.city || '');

  // Fill checkout summary
  const list  = $('#checkoutItemsList');
  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (list) {
    list.innerHTML = state.cart.map(item => `
      <div class="checkout-item">
        <div>
          <div class="checkout-item-name">${item.name}</div>
          <div class="checkout-item-meta">Size: ${item.size} &nbsp;×&nbsp; Qty: ${item.qty}</div>
        </div>
        <div class="checkout-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
      </div>`).join('');
  }
  const totalEl = $('#checkoutTotal');
  if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN');

  // Pre-fill saved address if available
  if (auth.user) {
    if (auth.user.address) {
      const el = document.getElementById('coAddress');
      if (el) el.value = auth.user.address;
    }
    if (auth.user.pincode) {
      const pinEl = document.getElementById('coPincode');
      if (pinEl) {
        pinEl.value = auth.user.pincode;
        onPincodeInput(auth.user.pincode);
      }
    }
  }

  // Clear previous errors
  const errEl = $('#checkoutError');
  if (errEl) { errEl.classList.remove('show'); errEl.textContent = ''; }

  document.body.style.overflow = 'hidden';
  $('#checkoutOverlay')?.classList.add('open');
  $('#checkoutModal')?.classList.add('open');
}

function closeCart() {
  $('#cartDrawer')?.classList.remove('open');
  $('#cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function closeCheckoutModal(e) {
  if (e && e.target !== $('#checkoutOverlay')) return;
  $('#checkoutOverlay')?.classList.remove('open');
  $('#checkoutModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── PLACE ORDER ───────────────────────────────────────────────────
async function placeOrder() {
  const address   = document.getElementById('coAddress')?.value.trim();
  const city      = document.getElementById('coCity')?.value.trim();
  const state_v   = document.getElementById('coState')?.value.trim();
  const pincode   = document.getElementById('coPincode')?.value.trim();
  const landmark  = document.getElementById('coLandmark')?.value.trim();
  const altPhone  = document.getElementById('coAltPhone')?.value.trim();
  const notes     = document.getElementById('coNotes')?.value.trim();
  const btn       = document.getElementById('placeOrderBtn');
  const errEl     = document.getElementById('checkoutError');

  // Strict Address & Location Validation
  if (!pincode || !/^[1-9]\d{5}$/.test(pincode)) {
    showCheckoutError('Please enter a valid 6-digit Indian Postal PIN code (e.g. 626123)');
    document.getElementById('coPincode')?.focus();
    return;
  }
  if (!state_v) {
    showCheckoutError('Please select your State from the dropdown');
    document.getElementById('coState')?.focus();
    return;
  }
  if (!city) {
    showCheckoutError('Please select or specify your City / District');
    document.getElementById('coCity')?.focus();
    return;
  }
  if (!address || address.length < 8) {
    showCheckoutError('Please enter complete street address (Door/Flat no, Street, Area - min 8 characters)');
    document.getElementById('coAddress')?.focus();
    return;
  }
  if (altPhone) {
    const cleanAlt = altPhone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanAlt)) {
      showCheckoutError('Alternate delivery phone must be a valid 10-digit mobile number');
      document.getElementById('coAltPhone')?.focus();
      return;
    }
  }

  if (!auth.token) { showCheckoutError('You must be logged in to place an order'); return; }
  if (!state.cart.length) { showCheckoutError('Your cart is empty'); return; }

  btn.disabled  = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';
  if (errEl) { errEl.classList.remove('show'); }

  try {
    const data = await nskFetch('/api/orders', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
      },
      body: JSON.stringify({
        items:   state.cart.map(i => ({ productId: String(i.id), name: i.name, price: i.price, size: i.size, qty: i.qty, image: i.img })),
        address,
        city,
        state:   state_v,
        pincode,
        landmark,
        altPhone,
        notes,
      }),
    });

    // Save selected location to user profile in background
    if (auth.user) {
      auth.user.address = address;
      auth.user.city    = city;
      auth.user.state   = state_v;
      auth.user.pincode = pincode;
      saveAuth(auth.token, auth.user);
    }

    // Success! Clear cart, show success modal
    state.cart = [];
    saveCart();
    updateCartUI();

    closeCheckoutModal();

    const orderIdEl = $('#successOrderId');
    if (orderIdEl) orderIdEl.textContent = `Order ID: #${data.orderId}`;

    $('#successOverlay')?.classList.add('open');
    $('#successModal')?.classList.add('open');

  } catch (err) {
    showCheckoutError(err.message);
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '<i class="fas fa-check-circle"></i> Place Order (COD)';
  }
}

function showCheckoutError(msg) {
  const el = document.getElementById('checkoutError');
  if (el) { el.textContent = msg; el.classList.add('show'); }
}

// ── SUCCESS MODAL ─────────────────────────────────────────────────
function closeSuccessModal() {
  $('#successOverlay')?.classList.remove('open');
  $('#successModal')?.classList.remove('open');
  document.body.style.overflow = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── MY ORDERS ─────────────────────────────────────────────────────
async function showMyOrders() {
  $('#userDropdown')?.classList.remove('open');
  if (!auth.token) { openAuthModal('login'); return; }

  document.body.style.overflow = 'hidden';
  $('#ordersOverlay')?.classList.add('open');
  $('#ordersModal')?.classList.add('open');

  const listEl = document.getElementById('myOrdersList');
  if (listEl) listEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--grey-600);"><i class="fas fa-spinner fa-spin" style="font-size:24px;"></i></div>';

  try {
    const orders = await nskFetch('/api/orders/my', {
      headers: { Authorization: `Bearer ${auth.token}` }
    });

    if (!orders.length) {
      listEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--grey-600);"><i class="fas fa-box-open" style="font-size:36px;opacity:.4;"></i><p style="margin-top:10px;">No orders yet. Start shopping!</p></div>';
      return;
    }

    listEl.innerHTML = orders.map(o => `
      <div class="order-card">
        <div class="order-card-header">
          <div class="order-card-id">Order #${o.orderId}</div>
          <span class="order-status-badge order-status-${o.status}">${o.status}</span>
        </div>
        ${(o.items || []).map(i => `<div class="order-item-line">• ${i.name} (${i.size}) × ${i.qty}</div>`).join('')}
        <div style="font-size:12px;color:var(--grey-600);margin:8px 0;line-height:1.4;background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:6px;">
          📍 <strong>Ship to:</strong> ${o.address}${o.landmark ? ` (${o.landmark})` : ''}, ${o.city}, ${o.state} - <strong>${o.pincode}</strong>
        </div>
        <div class="order-total-line">Total: ₹${(o.total || 0).toLocaleString('en-IN')} &nbsp;|&nbsp; <span style="color:var(--gold);font-weight:600;">Cash on Delivery</span> &nbsp;|&nbsp; <span style="color:var(--grey-600);font-size:12px;">${new Date(o.createdAt).toLocaleDateString('en-IN')}</span></div>
      </div>`).join('');

  } catch (err) {
    if (listEl) listEl.innerHTML = `<div style="text-align:center;padding:20px;color:#dc2626;">${err.message}</div>`;
  }
}

function closeOrdersModal(e) {
  if (e && e.target !== $('#ordersOverlay')) return;
  $('#ordersOverlay')?.classList.remove('open');
  $('#ordersModal')?.classList.remove('open');
  document.body.style.overflow = '';
}


