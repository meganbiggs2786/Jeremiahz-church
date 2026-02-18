# Tuath Coir E-Commerce Platform

**Ancient Celtic Roots. Street Justice.**

Tuath Coir is a high-performance e-commerce dropshipping platform built on Cloudflare Workers and D1 Database. It features auto-fulfillment integrations with Printful, EPROLO, Zendrop, and Faire.

## Tech Stack
- **Backend:** Cloudflare Workers (JavaScript/ES6)
- **Database:** Cloudflare D1 (SQLite)
- **Payments:** Stripe API
- **Fulfillment:** Printful, EPROLO, Zendrop, Faire
- **Frontend:** HTML5, CSS3, Vanilla JavaScript

## Project Structure
- `worker/index.js`: Main API and Admin Dashboard logic.
- `database/schema.sql`: D1 Database structure and initial data.
- `frontend/`: Static storefront files.
- `wrangler.toml`: Cloudflare configuration.

## Deployment Instructions

### 1. Initialize Database
```bash
wrangler d1 create tuath_coir_db
```
Copy the `database_id` from the output into your `wrangler.toml`.

### 2. Setup Schema
```bash
wrangler d1 execute tuath_coir_db --file=database/schema.sql --remote
```

### 3. Configure Secrets
Set up your admin credentials:
```bash
wrangler secret put ADMIN_USERNAME
# Enter your admin username (default: admin)

wrangler secret put ADMIN_PASSWORD_HASH
# Enter the SHA-256 hash of your password
# Example: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (for empty password, replace with your own)
```

Configure integration keys:
```bash
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put PRINTFUL_API_KEY
wrangler secret put EPROLO_API_KEY
wrangler secret put ZENDROP_API_KEY
wrangler secret put FAIRE_API_TOKEN
```

### 4. Deploy
```bash
wrangler deploy
```

## Admin Access
Access the Command Center at `https://your-worker-url.workers.dev/admin`.
- **Default Username:** admin
- **Owners:** Megan & Joy

---
*Created with honor and strength.* ⚔️
