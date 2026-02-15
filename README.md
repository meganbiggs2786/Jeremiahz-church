# TUATH COIR TERRITORIES

**Ancient Celtic Roots. Street Justice.**

Premium Irish-themed Urban Wear e-commerce platform featuring hoodies, athletic clothes, and hip-hop inspired streetwear.

## 🚀 Quick Start

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create database
wrangler d1 create tuath_coir_db

# Update database_id in wrangler.toml with the ID from above

# Create tables
wrangler d1 execute tuath_coir_db --file=database/schema.sql

# Seed products
wrangler d1 execute tuath_coir_db --file=database/seed.sql

# Deploy
wrangler deploy
```

## 📋 Project Type

**Backend API** - Cloudflare Workers + D1 Database

**NOT** a mobile app, NOT React Native, NOT Expo.

## 🏗️ Architecture

- **Runtime:** Cloudflare Workers (V8 JavaScript)
- **Database:** D1 (SQLite)
- **Payments:** Stripe
- **Fulfillment:** Printful, EPROLO, Faire
- **Deployment:** Global edge network

## 📦 Products

- **Urban Apparel** - Premium hoodies and tees ($24.99 - $49.99)
- **Athletic Wear** - Performance-focused street style ($29.99 - $59.99)
- **Accessories** - Hip-hop inspired hats and more ($19.99 - $34.99)
- **Bundles** - Curated streetwear collections ($64.99 - $129.99)

## 🌐 API Endpoints

- `GET /` - Landing page
- `GET /api/products` - Product catalog
- `GET /api/products/:id` - Single product
- `GET /api/categories` - Categories
- `GET /health` - Health check

## 👥 Owners

Megan & Joy

## 📈 Business Model: The $0 Launch

Launch a premium brand with **zero upfront costs**:
- **Zero Inventory:** Pay suppliers ONLY after the customer pays you.
- **Serverless Tech:** Hosted on Cloudflare's free tier (up to 100k requests/day).
- **Just-in-Time Fulfillment:** Automated orders to Printful, EPROLO, and more.

## 🔧 Tech Stack

- Cloudflare Workers (Serverless)
- D1 Database (SQLite)
- Stripe API (Payments)
- Printful API (Print-on-Demand)
- EPROLO API (Dropshipping)

## 📝 Development Phases

- ✅ **Phase 1:** Foundation API + Database
- ✅ **Phase 2:** Payments + Admin Dashboard
- ⏳ **Phase 3:** Frontend React App

## 🏁 Launch Readiness
✅ Complete e-commerce platform
✅ Branded landing page
✅ Megan & Joy admin dashboard
✅ Auto-fulfillment to all suppliers
✅ Pay-after-sale model
✅ $0 upfront cost

## 📄 License

Private - All Rights Reserved

## 🔗 Links

- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./docs/API.md)
- [Architecture](./docs/ARCHITECTURE.md)
