# NSK APPAREL — Premium Streetwear & Fashion E-Commerce Platform

A modern, high-performance streetwear e-commerce platform built with HTML5, CSS3, JavaScript, Node.js, Express, and an embedded persistent NoSQL database (with MongoDB Atlas support).

## ✨ Features

- **Storefront & Catalog:** Dynamic product catalog with category filtering (Tees, Hoodies, Caps, Bottoms), live search, size chips, and product quick view modal.
- **Cart & Wishlist:** Real-time cart drawer with instant quantity increment/decrement, size variation support, and wishlist bookmarking.
- **Checkout & Order Flow:** Comprehensive multi-field checkout with street address validation, delivery options (Cash on Delivery), order tracking, and email confirmation via Nodemailer.
- **Customer Authentication:** Secure customer registration, login, and user profile management with JWT and Bcrypt password hashing.
- **Admin Control Dashboard (`/admin`):**
  - Live revenue, order, customer, and product statistics.
  - Full Product CRUD (Add, Edit, Delete, Toggle Stock/Featured, Image Upload & Image URL support).
  - Order Management (Status updates: Pending, Processing, Shipped, Delivered, Cancelled).
  - Customer Accounts inspection, status toggle (Active, VIP, Blocked), and order history.
- **Flexible Database Architecture:** Zero-dependency embedded NoSQL database (`data/*.json`) by default, with seamless one-line MongoDB Atlas integration.

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/nskapparell/nskweb.git
cd nskweb
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your details:
```bash
cp .env.example .env
```

### 4. Start the Application
```bash
# Start in watch/dev mode
npm run dev

# Or standard start
npm start
```

Visit the application at:
- **Storefront:** [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)

## 📁 Project Structure

```
├── assets/             # Images, logos, product photos & uploads
├── data/               # Persistent JSON data stores (products, orders, users)
├── admin.html          # Admin dashboard interface
├── index.html          # Customer-facing storefront
├── nosql.js            # Embedded file-based NoSQL database engine
├── package.json        # Project metadata and dependencies
├── script.js           # Client-side store interactions & dynamic renderer
├── server.js           # Express REST API, auth & order processing
└── style.css           # Styling, animations & responsive layout
```

## 🛡️ License
ISC License — © NSK APPAREL
