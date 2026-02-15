# TUATH COIR

**Ancient Celtic Roots. Street Justice.**

Premium Irish-themed e-commerce platform with men's grooming products and handmade bath items.

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

- **Irish Apparel** - Print-on-demand clothing ($24.99 - $49.99)
- **Men's Hygiene** - Grooming kits ($29.99 - $49.99)
- **Handmade Bath** - Artisan soaps ($9.99 - $19.99)
- **Bundles** - High-profit combinations ($64.99 - $129.99)

## 🌐 API Endpoints

- `GET /` - Landing page
- `GET /api/products` - Product catalog
- `GET /api/products/:id` - Single product
- `GET /api/categories` - Categories
- `GET /health` - Health check

## 👥 Owners

Megan & Joy

## 📈 Business Model

Pay suppliers ONLY after customer pays you.
Zero inventory, zero upfront costs.

## 🔧 Tech Stack

- Cloudflare Workers (Serverless)
- D1 Database (SQLite)
- Stripe API (Payments)
- Printful API (Print-on-Demand)
- EPROLO API (Dropshipping)

## 📝 Development Phases

- ✅ **Phase 1:** Foundation API + Database
- ⏳ **Phase 2:** Payments + Admin Dashboard
- ⏳ **Phase 3:** Frontend React App

## 📄 License

Private - All Rights Reserved

## 🔗 Links

- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./docs/API.md)
- [Architecture](./docs/ARCHITECTURE.md)
