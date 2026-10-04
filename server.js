/* ============================================================
   NSK APPAREL — Backend Server
   Express + MongoDB + Nodemailer + JWT Auth
   ============================================================ */

'use strict';

require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const nodemailer = require('nodemailer');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const cors       = require('cors');
const path       = require('path');
const multer     = require('multer');
const fs         = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Ensure uploads folder exists ─────────────────────────────
const uploadsDir = path.join(__dirname, 'assets', 'images', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));  // serve frontend

// ── Multer (file uploads for product images) ─────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// ── Embedded NoSQL Database (Zero-config, fast, persistent) ──
const nosql = require('./nosql');

// ══════════════════════════════════════════════════════════════
//  DATABASE MODELS (Dual Adapter: MongoDB Atlas or Local NoSQL)
// ══════════════════════════════════════════════════════════════

// ── User Mongoose Schema ─────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:      { type: String, required: true, trim: true },
  password:   { type: String, required: true },
  status:     { type: String, default: 'Active', enum: ['Active', 'VIP', 'Blocked'] },
  address:    { type: String, default: '' },
  city:       { type: String, default: '' },
  state:      { type: String, default: '' },
  pincode:    { type: String, default: '' },
  createdAt:  { type: Date, default: Date.now },
});
const MongooseUser = mongoose.model('User', userSchema);

// ── Product Mongoose Schema ──────────────────────────────────
const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  originalPrice: { type: Number },
  category:    { type: String, required: true, enum: ['tees','hoodies','caps','bottoms','accessories'] },
  sizes:       [String],
  image:       { type: String, default: '' },
  description: { type: String, default: '' },
  badge:       { type: String, default: '' },
  inStock:     { type: Boolean, default: true },
  featured:    { type: Boolean, default: false },
  rating:      { type: Number, default: 4.5 },
  reviews:     { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now },
});
const MongooseProduct = mongoose.model('Product', productSchema);

// ── Order Mongoose Schema ────────────────────────────────────
const orderSchema = new mongoose.Schema({
  orderId:    { type: String, unique: true },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName:   String,
  userEmail:  String,
  userPhone:  String,
  address:    String,
  city:       String,
  state:      String,
  pincode:    String,
  landmark:   { type: String, default: '' },
  altPhone:   { type: String, default: '' },
  items:      [{
    productId: String,
    name:      String,
    price:     Number,
    size:      String,
    qty:       Number,
    image:     String,
  }],
  total:       Number,
  payment:    { type: String, default: 'COD' },
  status:     { type: String, default: 'Pending', enum: ['Pending','Processing','Shipped','Delivered','Cancelled'] },
  notes:      { type: String, default: '' },
  createdAt:  { type: Date, default: Date.now },
});
const MongooseOrder = mongoose.model('Order', orderSchema);

// ── Unified Database Proxies (Seamlessly switches between Mongo & NoSQL)
const isMongoConnected = () => mongoose.connection.readyState === 1;

const User = {
  findOne:           (...args) => (isMongoConnected() ? MongooseUser.findOne(...args) : nosql.User.findOne(...args)),
  findById:          (...args) => (isMongoConnected() ? MongooseUser.findById(...args) : nosql.User.findById(...args)),
  find:              (...args) => (isMongoConnected() ? MongooseUser.find(...args) : nosql.User.find(...args)),
  create:            (...args) => (isMongoConnected() ? MongooseUser.create(...args) : nosql.User.create(...args)),
  findByIdAndUpdate: (...args) => (isMongoConnected() ? MongooseUser.findByIdAndUpdate(...args) : nosql.User.findByIdAndUpdate(...args)),
  findByIdAndDelete: (...args) => (isMongoConnected() ? MongooseUser.findByIdAndDelete(...args) : nosql.User.findByIdAndDelete(...args)),
  countDocuments:    (...args) => (isMongoConnected() ? MongooseUser.countDocuments(...args) : nosql.User.countDocuments(...args)),
};

const Product = {
  find:              (...args) => (isMongoConnected() ? MongooseProduct.find(...args) : nosql.Product.find(...args)),
  findById:          (...args) => (isMongoConnected() ? MongooseProduct.findById(...args) : nosql.Product.findById(...args)),
  create:            (...args) => (isMongoConnected() ? MongooseProduct.create(...args) : nosql.Product.create(...args)),
  findByIdAndUpdate: (...args) => (isMongoConnected() ? MongooseProduct.findByIdAndUpdate(...args) : nosql.Product.findByIdAndUpdate(...args)),
  findByIdAndDelete: (...args) => (isMongoConnected() ? MongooseProduct.findByIdAndDelete(...args) : nosql.Product.findByIdAndDelete(...args)),
  countDocuments:    (...args) => (isMongoConnected() ? MongooseProduct.countDocuments(...args) : nosql.Product.countDocuments(...args)),
};

const Order = {
  find:              (...args) => (isMongoConnected() ? MongooseOrder.find(...args) : nosql.Order.find(...args)),
  findById:          (...args) => (isMongoConnected() ? MongooseOrder.findById(...args) : nosql.Order.findById(...args)),
  create:            (...args) => (isMongoConnected() ? MongooseOrder.create(...args) : nosql.Order.create(...args)),
  findByIdAndUpdate: (...args) => (isMongoConnected() ? MongooseOrder.findByIdAndUpdate(...args) : nosql.Order.findByIdAndUpdate(...args)),
  findByIdAndDelete: (...args) => (isMongoConnected() ? MongooseOrder.findByIdAndDelete(...args) : nosql.Order.findByIdAndDelete(...args)),
  countDocuments:    (...args) => (isMongoConnected() ? MongooseOrder.countDocuments(...args) : nosql.Order.countDocuments(...args)),
};

// ══════════════════════════════════════════════════════════════
//  NODEMAILER TRANSPORTER
// ══════════════════════════════════════════════════════════════
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, ''),
  },
});

async function sendOrderEmailToAdmin(order) {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.size}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.qty}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${(item.price * item.qty).toLocaleString('en-IN')}</td>
    </tr>`).join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:620px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 100%);padding:30px;text-align:center;">
        <h1 style="color:#d4af37;margin:0;font-size:26px;letter-spacing:3px;">NSK APPAREL</h1>
        <p style="color:#aaa;margin:5px 0 0;font-size:13px;letter-spacing:1px;">NEW ORDER RECEIVED 🛍️</p>
      </div>

      <!-- Alert Banner -->
      <div style="background:#d4af37;padding:12px;text-align:center;">
        <strong style="color:#000;font-size:15px;">⚡ Order #${order.orderId} — Cash on Delivery</strong>
      </div>

      <!-- Customer Info -->
      <div style="padding:25px 30px;">
        <h2 style="color:#1a1a2e;font-size:16px;border-bottom:2px solid #d4af37;padding-bottom:8px;margin-bottom:15px;">👤 Customer Details</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:5px 0;color:#666;width:130px;">Name:</td><td style="padding:5px 0;font-weight:600;">${order.userName}</td></tr>
          <tr><td style="padding:5px 0;color:#666;">Email:</td><td style="padding:5px 0;">${order.userEmail}</td></tr>
          <tr><td style="padding:5px 0;color:#666;">Phone:</td><td style="padding:5px 0;">${order.userPhone}</td></tr>
          ${order.altPhone ? `<tr><td style="padding:5px 0;color:#666;">Alt Phone:</td><td style="padding:5px 0;">${order.altPhone}</td></tr>` : ''}
          <tr><td style="padding:5px 0;color:#666;">Address:</td><td style="padding:5px 0;font-weight:600;">${order.address}${order.landmark ? ` (Landmark: ${order.landmark})` : ''}, ${order.city}, ${order.state} - ${order.pincode}</td></tr>
        </table>

        <!-- Order Items -->
        <h2 style="color:#1a1a2e;font-size:16px;border-bottom:2px solid #d4af37;padding-bottom:8px;margin:20px 0 15px;">🛒 Order Items</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#f8f8f8;">
              <th style="padding:10px 8px;text-align:left;color:#333;">Product</th>
              <th style="padding:10px 8px;text-align:center;color:#333;">Size</th>
              <th style="padding:10px 8px;text-align:center;color:#333;">Qty</th>
              <th style="padding:10px 8px;text-align:right;color:#333;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <!-- Total -->
        <div style="background:#1a1a2e;border-radius:8px;padding:15px 20px;margin-top:15px;display:flex;justify-content:space-between;">
          <span style="color:#aaa;font-size:15px;">Order Total</span>
          <strong style="color:#d4af37;font-size:20px;">₹${order.total.toLocaleString('en-IN')}</strong>
        </div>

        <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:12px 16px;margin-top:15px;font-size:13px;color:#856404;">
          💵 <strong>Payment Method:</strong> Cash on Delivery — Collect ₹${order.total.toLocaleString('en-IN')} at delivery
        </div>

        ${order.notes ? `<div style="background:#f0f4ff;border-radius:8px;padding:12px 16px;margin-top:10px;font-size:13px;"><strong>📝 Customer Note:</strong> ${order.notes}</div>` : ''}

        <div style="margin-top:20px;text-align:center;">
          <p style="color:#666;font-size:13px;">Order placed on: ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f8f8f8;padding:15px;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee;">
        NSK APPAREL Admin Panel &nbsp;|&nbsp; This is an automated notification
      </div>
    </div>
  </body>
  </html>`;

  if (!process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD.includes('YOUR_16_CHAR')) {
    console.log(`ℹ️ [Email Skipped] Admin order notification #${order.orderId}: Gmail App Password not configured in .env`);
    return;
  }

  await transporter.sendMail({
    from:    `"NSK APPAREL Store" <${process.env.GMAIL_USER}>`,
    to:      process.env.ADMIN_EMAIL,
    subject: `🛍️ New Order #${order.orderId} — ₹${order.total.toLocaleString('en-IN')} (COD)`,
    html,
  });
  console.log(`✅ Admin email sent to ${process.env.ADMIN_EMAIL} for Order #${order.orderId}`);
}

async function sendOrderConfirmationToUser(order) {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.size}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.qty}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${(item.price * item.qty).toLocaleString('en-IN')}</td>
    </tr>`).join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:620px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 100%);padding:30px;text-align:center;">
        <h1 style="color:#d4af37;margin:0;font-size:26px;letter-spacing:3px;">NSK APPAREL</h1>
        <p style="color:#aaa;margin:5px 0 0;font-size:13px;letter-spacing:1px;">ORDER CONFIRMED ✅</p>
      </div>
      <div style="background:#28a745;padding:12px;text-align:center;">
        <strong style="color:#fff;font-size:15px;">Thank you, ${order.userName}! Your order is confirmed 🎉</strong>
      </div>
      <div style="padding:25px 30px;">
        <p style="font-size:14px;color:#555;">Order ID: <strong style="color:#1a1a2e;">#${order.orderId}</strong></p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:10px;">
          <thead>
            <tr style="background:#f8f8f8;">
              <th style="padding:10px 8px;text-align:left;">Product</th>
              <th style="padding:10px 8px;text-align:center;">Size</th>
              <th style="padding:10px 8px;text-align:center;">Qty</th>
              <th style="padding:10px 8px;text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="background:#1a1a2e;border-radius:8px;padding:15px 20px;margin-top:15px;">
          <span style="color:#aaa;font-size:15px;">Total Amount: </span>
          <strong style="color:#d4af37;font-size:20px;float:right;">₹${order.total.toLocaleString('en-IN')}</strong>
        </div>
        <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:12px 16px;margin-top:15px;font-size:13px;">
          💵 <strong>Payment:</strong> Cash on Delivery — Pay ₹${order.total.toLocaleString('en-IN')} when your order arrives.
        </div>
        <div style="margin-top:20px;padding:15px;background:#f0f4ff;border-radius:8px;font-size:13px;">
          <p style="margin:0;"><strong>Delivery Address:</strong><br/>${order.address}${order.landmark ? `<br/>Landmark: ${order.landmark}` : ''}<br/>${order.city}, ${order.state} - ${order.pincode}</p>
          ${order.altPhone ? `<p style="margin:6px 0 0;color:#555;">Alt Phone: ${order.altPhone}</p>` : ''}
        </div>
        <p style="font-size:13px;color:#888;margin-top:20px;text-align:center;">Questions? Contact us at ${process.env.ADMIN_EMAIL}</p>
      </div>
      <div style="background:#f8f8f8;padding:15px;text-align:center;font-size:12px;color:#999;">
        NSK APPAREL — Premium Streetwear | Est. 2024
      </div>
    </div>
  </body>
  </html>`;

  if (!process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD.includes('YOUR_16_CHAR')) {
    console.log(`ℹ️ [Email Skipped] Customer confirmation #${order.orderId}: Gmail App Password not configured in .env`);
    return;
  }

  await transporter.sendMail({
    from:    `"NSK APPAREL" <${process.env.GMAIL_USER}>`,
    to:      order.userEmail,
    subject: `✅ Order Confirmed #${order.orderId} — NSK APPAREL`,
    html,
  });
  console.log(`✅ Customer email sent to ${order.userEmail} for Order #${order.orderId}`);
}

// ══════════════════════════════════════════════════════════════
//  JWT MIDDLEWARE
// ══════════════════════════════════════════════════════════════
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function adminMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Admin access required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ error: 'Forbidden: Admins only' });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
}

// ══════════════════════════════════════════════════════════════
//  API ROUTES
// ══════════════════════════════════════════════════════════════

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString(), db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ── Strict Input Validation Helpers ──────────────────────────
const dns = require('dns').promises;

function validateName(name) {
  if (!name || typeof name !== 'string') return { valid: false, error: 'Full name is required and must be text' };
  const clean = name.trim().replace(/\s+/g, ' ');
  if (clean.length < 2 || clean.length > 50) return { valid: false, error: 'Full name must be between 2 and 50 characters' };
  if (!/^[A-Za-z\s.'-]{2,50}$/.test(clean)) return { valid: false, error: 'Full name can only contain letters, spaces, hyphens, and apostrophes' };
  if (!/[A-Za-z]{2,}/.test(clean)) return { valid: false, error: 'Full name must contain real alphabetic letters' };
  if (/^([A-Za-z])\1{3,}$/i.test(clean)) return { valid: false, error: 'Please enter your genuine full name' };
  return { valid: true, cleanName: clean };
}

function validatePhone(phone) {
  if (!phone) return { valid: false, error: 'Phone number is required' };
  let clean = String(phone).replace(/[\s\-\(\)\+]/g, '');
  if (clean.startsWith('91') && clean.length === 12) clean = clean.slice(2);
  if (clean.startsWith('0') && clean.length === 11) clean = clean.slice(1);
  if (!/^\d{10}$/.test(clean)) return { valid: false, error: 'Please enter a valid 10-digit mobile number' };
  if (!/^[6-9]\d{9}$/.test(clean)) return { valid: false, error: 'Mobile number must start with 6, 7, 8, or 9' };
  if (/^(\d)\1{7,}$/.test(clean) || clean === '1234567890') return { valid: false, error: 'Please enter a real, active mobile phone number' };
  return { valid: true, cleanPhone: clean };
}

async function validateEmail(email) {
  if (!email || typeof email !== 'string') return { valid: false, error: 'Email address is required' };
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(clean)) return { valid: false, error: 'Please enter a valid email format (e.g. yourname@gmail.com)' };

  const parts = clean.split('@');
  if (parts.length !== 2) return { valid: false, error: 'Invalid email address structure' };

  const domain = parts[1];
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) return { valid: false, error: 'Email domain extension (TLD) is invalid' };

  // Common typos check
  const commonTypos = {
    'gmial.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com'
  };
  if (commonTypos[domain]) {
    return { valid: false, error: `Invalid domain. Did you mean ${parts[0]}@${commonTypos[domain]}?` };
  }

  // Trusted popular domains - instant pass
  const trustedDomains = [
    'gmail.com', 'yahoo.com', 'yahoo.co.in', 'outlook.com', 'hotmail.com',
    'icloud.com', 'proton.me', 'protonmail.com', 'zoho.com', 'rediffmail.com'
  ];
  if (trustedDomains.includes(domain)) return { valid: true, cleanEmail: clean };

  // DNS MX verification for other domains to ensure it can receive emails
  try {
    const resolvePromise = dns.resolveMx(domain);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2500));
    const mx = await Promise.race([resolvePromise, timeoutPromise]);
    if (!mx || mx.length === 0) {
      return { valid: false, error: `The email domain "${domain}" cannot receive mail. Please use a real email address.` };
    }
    return { valid: true, cleanEmail: clean };
  } catch (err) {
    if (err.message === 'TIMEOUT') return { valid: true, cleanEmail: clean };
    return { valid: false, error: `The email domain "${domain}" does not exist or has no mail server.` };
  }
}

// ── Valid Indian States & Delivery Address Validator ───────────
const VALID_INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
];

function validateOrderAddress({ address, city, state, pincode, altPhone }) {
  if (!pincode || !/^[1-9]\d{5}$/.test(String(pincode).trim())) {
    return { valid: false, error: 'Please enter a valid 6-digit Indian Postal PIN code (e.g. 626123)' };
  }
  if (!state || typeof state !== 'string') {
    return { valid: false, error: 'Please select a valid State from the list' };
  }
  const matchedState = VALID_INDIAN_STATES.find(s => s.toLowerCase() === state.trim().toLowerCase());
  if (!matchedState) {
    return { valid: false, error: `"${state}" is not a recognized Indian State or Union Territory.` };
  }
  if (!city || typeof city !== 'string' || city.trim().length < 2) {
    return { valid: false, error: 'Please select or enter a valid City / District' };
  }
  if (!address || typeof address !== 'string' || address.trim().length < 8) {
    return { valid: false, error: 'Please enter your complete street address (Door/Flat no, Street, Area - min 8 characters)' };
  }
  if (altPhone) {
    const cleanAlt = String(altPhone).replace(/[\s\-\(\)\+]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanAlt)) {
      return { valid: false, error: 'Alternate delivery phone must be a valid 10-digit mobile number' };
    }
  }
  return {
    valid: true,
    cleanAddress: address.trim(),
    cleanCity: city.trim(),
    cleanState: matchedState,
    cleanPincode: String(pincode).trim(),
    cleanAltPhone: altPhone ? String(altPhone).replace(/[\s\-\(\)\+]/g, '') : '',
  };
}

// ── USER AUTH ROUTES ─────────────────────────────────────────

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // 1. Strict Name check
    const nameCheck = validateName(name);
    if (!nameCheck.valid) return res.status(400).json({ error: nameCheck.error });

    // 2. Strict Phone check
    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) return res.status(400).json({ error: phoneCheck.error });

    // 3. Strict Real Email check (syntax + DNS MX record verification)
    const emailCheck = await validateEmail(email);
    if (!emailCheck.valid) return res.status(400).json({ error: emailCheck.error });

    // 4. Password check
    if (!password || typeof password !== 'string' || password.trim().length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Block admin email from registering as regular user
    if (emailCheck.cleanEmail === process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(400).json({ error: 'This email is reserved for administration' });
    }

    const exists = await User.findOne({ email: emailCheck.cleanEmail });
    if (exists) return res.status(409).json({ error: 'This email is already registered. Please login.' });

    const hashed = await bcrypt.hash(password, 12);
    const user   = await User.create({
      name:     nameCheck.cleanName,
      email:    emailCheck.cleanEmail,
      phone:    phoneCheck.cleanPhone,
      password: hashed,
    });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, isAdmin: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login (Supports both Regular Customers and Admin directly)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const emailCheck = await validateEmail(email);
    if (!emailCheck.valid) return res.status(400).json({ error: emailCheck.error });

    // ── Check if logging in as Admin directly ────────────────
    const adminEmail = (process.env.ADMIN_EMAIL || 'apparelnsk@gmail.com').trim().toLowerCase();
    if (emailCheck.cleanEmail === adminEmail) {
      const envPass   = String(process.env.ADMIN_PASSWORD || '').trim();
      const inputPass = String(password).trim();

      const isExact      = inputPass === envPass;
      const isNormalized = inputPass.replace(/_+/g, '_') === envPass.replace(/_+/g, '_');
      const isCanonical  = inputPass.replace(/_+/g, '___') === 'NSK___&#@70070010';

      if (!isExact && !isNormalized && !isCanonical) {
        return res.status(401).json({ error: 'Incorrect admin password' });
      }

      const token = jwt.sign(
        { id: 'admin_root', email: process.env.ADMIN_EMAIL, isAdmin: true, name: 'NSK Admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        isAdmin: true,
        user: {
          id: 'admin_root',
          name: 'NSK Admin',
          email: process.env.ADMIN_EMAIL,
          phone: '9876543210',
          isAdmin: true,
        },
        message: 'Logged in as Admin!',
      });
    }

    // ── Customer Login ────────────────────────────────────────
    const user = await User.findOne({ email: emailCheck.cleanEmail });
    if (!user) return res.status(401).json({ error: 'No account found with this email' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, isAdmin: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, isAdmin: false, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: false } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get current user profile
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    if (req.user.isAdmin || req.user.id === 'admin_root') {
      return res.json({
        _id: 'admin_root',
        name: req.user.name || 'NSK Admin',
        email: req.user.email || process.env.ADMIN_EMAIL,
        phone: '9876543210',
        isAdmin: true,
      });
    }
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, city, state, pincode },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// ── ADMIN AUTH ────────────────────────────────────────────────
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Credentials required' });

    const cleanEmail = String(email).trim().toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || 'apparelnsk@gmail.com').trim().toLowerCase();

    if (cleanEmail !== adminEmail)
      return res.status(401).json({ error: 'Admin not found' });

    const envPass = String(process.env.ADMIN_PASSWORD || '').trim();
    const inputPass = String(password).trim();

    // Flexible & robust match:
    // 1. Direct match with .env value (whether 3 or 7 underscores)
    // 2. Normalizing underscore count (e.g. NSK___ vs NSK_______)
    // 3. Match against canonical password 'NSK___&#@70070010'
    const isExact = inputPass === envPass;
    const isNormalized = inputPass.replace(/_+/g, '_') === envPass.replace(/_+/g, '_');
    const isCanonical = inputPass.replace(/_+/g, '___') === 'NSK___&#@70070010';

    if (!isExact && !isNormalized && !isCanonical)
      return res.status(401).json({ error: 'Incorrect admin password' });

    const token = jwt.sign(
      { email: process.env.ADMIN_EMAIL, isAdmin: true, name: 'Admin' },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.json({ token, admin: { email: process.env.ADMIN_EMAIL, name: 'NSK Admin' } });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

// ── PRODUCT ROUTES ────────────────────────────────────────────

// Get all products (public)
app.get('/api/products', async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (featured === 'true') filter.featured = true;
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product (public)
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (admin only)
app.post('/api/products', adminMiddleware, (req, res, next) => {
  upload.single('image')(req, res, err => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image size must be less than 5MB' });
      }
      return res.status(400).json({ error: err.message || 'Image upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { name, price, originalPrice, category, sizes, description, badge, inStock, featured, rating } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Product name is required' });
    if (!price || isNaN(+price) || +price <= 0) return res.status(400).json({ error: 'A valid price greater than 0 is required' });
    if (!category || !['tees','hoodies','caps','bottoms','accessories'].includes(category)) {
      return res.status(400).json({ error: 'Valid category (tees, hoodies, caps, bottoms, accessories) is required' });
    }

    let imagePath = '';
    if (req.file) {
      imagePath = `assets/images/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl && req.body.imageUrl.trim()) {
      imagePath = req.body.imageUrl.trim();
    } else if (req.body.image && req.body.image.trim()) {
      imagePath = req.body.image.trim();
    } else {
      imagePath = 'assets/images/tshirt_white.jpg';
    }

    let parsedSizes = [];
    if (Array.isArray(sizes)) {
      parsedSizes = sizes.map(s => String(s).trim()).filter(Boolean);
    } else if (typeof sizes === 'string' && sizes.trim()) {
      parsedSizes = sizes.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (!parsedSizes.length) {
      parsedSizes = ['Free Size'];
    }

    const product = await Product.create({
      name:          name.trim(),
      price:         +price,
      originalPrice: (originalPrice && +originalPrice > 0) ? +originalPrice : undefined,
      category,
      sizes:         parsedSizes,
      image:         imagePath,
      description:   (description || '').trim(),
      badge:         (badge || '').trim(),
      inStock:       inStock !== false && inStock !== 'false',
      featured:      featured === true || featured === 'true',
      rating:        rating ? +rating : 4.5,
    });
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product: ' + (err.message || 'Server error') });
  }
});

// Update product (admin only)
app.put('/api/products/:id', adminMiddleware, (req, res, next) => {
  upload.single('image')(req, res, err => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image size must be less than 5MB' });
      }
      return res.status(400).json({ error: err.message || 'Image upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) {
      update.image = `assets/images/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl !== undefined && req.body.imageUrl.trim()) {
      update.image = req.body.imageUrl.trim();
    } else if (req.body.image !== undefined && req.body.image.trim()) {
      update.image = req.body.image.trim();
    }
    delete update.imageUrl;

    if (update.name) update.name = update.name.trim();
    if (update.price !== undefined) {
      if (isNaN(+update.price) || +update.price <= 0) {
        return res.status(400).json({ error: 'A valid price greater than 0 is required' });
      }
      update.price = +update.price;
    }
    if (update.originalPrice !== undefined) {
      update.originalPrice = (+update.originalPrice > 0) ? +update.originalPrice : null;
    }
    if (update.sizes !== undefined) {
      if (typeof update.sizes === 'string') {
        update.sizes = update.sizes.split(',').map(s => s.trim()).filter(Boolean);
      } else if (!Array.isArray(update.sizes)) {
        update.sizes = ['Free Size'];
      }
    }
    if (update.inStock !== undefined) {
      update.inStock = update.inStock === true || update.inStock === 'true';
    }
    if (update.featured !== undefined) {
      update.featured = update.featured === true || update.featured === 'true';
    }
    if (update.rating !== undefined) {
      update.rating = +update.rating;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product: ' + (err.message || 'Server error') });
  }
});

// Delete product (admin only)
app.delete('/api/products/:id', adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ── ORDER ROUTES ──────────────────────────────────────────────

// Place order (authenticated users)
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { items, address, city, state, pincode, landmark, altPhone, notes } = req.body;

    if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty' });

    // Strict Delivery Address Validation
    const addrCheck = validateOrderAddress({ address, city, state, pincode, altPhone });
    if (!addrCheck.valid) return res.status(400).json({ error: addrCheck.error });

    let user;
    if (req.user.isAdmin || req.user.id === 'admin_root') {
      user = { _id: 'admin_root', name: req.user.name || 'NSK Admin', email: req.user.email || process.env.ADMIN_EMAIL, phone: '9876543210' };
    } else {
      user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
    }

    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const orderId = 'NSK' + Date.now().toString().slice(-8);

    const order = await Order.create({
      orderId,
      user:      user._id,
      userName:  user.name,
      userEmail: user.email,
      userPhone: user.phone,
      address:   addrCheck.cleanAddress,
      city:      addrCheck.cleanCity,
      state:     addrCheck.cleanState,
      pincode:   addrCheck.cleanPincode,
      landmark:  landmark ? landmark.trim() : '',
      altPhone:  addrCheck.cleanAltPhone,
      items,
      total,
      payment:   'COD',
      status:    'Pending',
      notes:     notes || '',
    });

    // Send emails (non-blocking — errors don't fail the order)
    Promise.all([
      sendOrderEmailToAdmin(order).catch(e => console.error('Admin email error:', e)),
      sendOrderConfirmationToUser(order).catch(e => console.error('User email error:', e)),
    ]);

    res.status(201).json({
      message:  'Order placed successfully! Check your email for confirmation.',
      orderId:  order.orderId,
      total:    order.total,
      status:   order.status,
    });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ error: 'Failed to place order. Please try again.' });
  }
});

// Get user's own orders
app.get('/api/orders/my', authMiddleware, async (req, res) => {
  try {
    const filter = (req.user.isAdmin || req.user.id === 'admin_root')
      ? { userEmail: process.env.ADMIN_EMAIL }
      : { user: req.user.id };
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ── ADMIN ROUTES ──────────────────────────────────────────────

// Get all orders (admin)
app.get('/api/admin/orders', adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order (admin)
app.get('/api/admin/orders/:id', adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Update order status (admin)
app.put('/api/admin/orders/:id/status', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Delete order (admin)
app.delete('/api/admin/orders/:id', adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Get dashboard stats (admin)
app.get('/api/admin/stats', adminMiddleware, async (req, res) => {
  try {
    const [totalOrders, totalProducts, totalUsers, orders] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Order.find().select('total status'),
    ]);
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    res.json({ totalOrders, totalProducts, totalUsers, totalRevenue, pendingOrders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all users with order metrics (admin)
app.get('/api/admin/users', adminMiddleware, async (req, res) => {
  try {
    const [users, orders] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }),
      Order.find().select('user userEmail total')
    ]);

    const usersWithStats = (users || []).map(u => {
      const userOrders = (orders || []).filter(o =>
        (o.user && String(o.user) === String(u._id)) ||
        (o.userEmail && o.userEmail.toLowerCase() === (u.email || '').toLowerCase())
      );
      return {
        ...u,
        status: u.status || 'Active',
        ordersCount: userOrders.length,
        totalSpent: userOrders.reduce((sum, o) => sum + (o.total || 0), 0)
      };
    });

    res.json(usersWithStats);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update customer status (Active / VIP / Blocked) (admin)
app.put('/api/admin/users/:id/status', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Active', 'VIP', 'Blocked'].includes(status)) {
      return res.status(400).json({ error: 'Invalid customer status. Must be Active, VIP, or Blocked' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'Customer not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customer status' });
  }
});

// Update customer details (admin)
app.put('/api/admin/users/:id', adminMiddleware, async (req, res) => {
  try {
    const { name, phone, city, state, status } = req.body;
    const update = {};
    if (name) update.name = name.trim();
    if (phone) update.phone = phone.trim();
    if (city !== undefined) update.city = city.trim();
    if (state !== undefined) update.state = state.trim();
    if (status && ['Active', 'VIP', 'Blocked'].includes(status)) update.status = status;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'Customer not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customer details' });
  }
});

// Delete customer account (admin)
app.delete('/api/admin/users/:id', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer account deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Get orders of a specific customer (admin)
app.get('/api/admin/users/:id/orders', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Customer not found' });
    const allOrders = await Order.find();
    const customerOrders = (allOrders || []).filter(o =>
      (o.user && String(o.user) === String(user._id)) ||
      (o.userEmail && o.userEmail.toLowerCase() === (user.email || '').toLowerCase())
    );
    res.json(customerOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
});

// Aliases for /api/admin/customers -> /api/admin/users
app.get('/api/admin/customers', adminMiddleware, async (req, res, next) => {
  req.url = '/api/admin/users';
  app.handle(req, res, next);
});
app.delete('/api/admin/customers/:id', adminMiddleware, async (req, res, next) => {
  req.url = `/api/admin/users/${req.params.id}`;
  app.handle(req, res, next);
});

// ── Error Handling Middleware ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── SPA Fallback (Express 5 compatible) ────────────────────────
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ══════════════════════════════════════════════════════════════
//  CONNECT TO DATABASE & START SERVER
// ══════════════════════════════════════════════════════════════
async function startServer() {
  let dbMode = 'Embedded Persistent NoSQL (data/*.json)';
  const mongoUri = process.env.MONGO_URI;
  const isPlaceholder = !mongoUri || mongoUri.includes('YOUR_USER') || mongoUri.includes('cluster0.xxxxx');

  if (!isPlaceholder) {
    try {
      console.log('⏳ Connecting to MongoDB Atlas...');
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      dbMode = `MongoDB Atlas (${mongoose.connection.host})`;
      console.log('✅ Connected to MongoDB Atlas:', mongoose.connection.host);
    } catch (err) {
      console.warn('⚠️ MongoDB Atlas connection error:', err.message);
      console.log('⚡ Active Database: Local Embedded NoSQL Document Engine (./data/)');
    }
  } else {
    console.log('⚡ Active Database: Local Embedded NoSQL Document Engine (./data/)');
  }

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  🚀 NSK APPAREL Server Running!`);
    console.log(`  🌐 Storefront:  http://localhost:${PORT}`);
    console.log(`  📦 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`  🗄️  Database:    ${dbMode}`);
    console.log(`  👑 Admin Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`======================================================\n`);
  });
}

startServer();
