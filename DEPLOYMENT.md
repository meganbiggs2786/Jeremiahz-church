# DEPLOYMENT GUIDE - TUATH COIR

## 🚀 COMPLETE DEPLOYMENT GUIDE

### STEP 1: Repository Setup
Ensure all files are in your repository:
- `worker/index.js` (The core API logic)
- `database/schema.sql` (Database structure)
- `database/seed.sql` (Initial product data)
- `wrangler.toml` (Cloudflare configuration)

### STEP 2: Create Cloudflare Worker
1. Go to: [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create Worker**
3. Name it: `tuath-coir-api` (or your preferred name)
4. Deploy the default code first to initialize.

### STEP 3: Setup D1 Database
1. Run: `wrangler d1 create tuath_coir_db`
2. Copy the `database_id` from the output.
3. Update `wrangler.toml` with this ID.
4. Create tables: `wrangler d1 execute tuath_coir_db --file=database/schema.sql`
5. Seed products: `wrangler d1 execute tuath_coir_db --file=database/seed.sql`

### STEP 4: Environment Variables & Secrets
In Cloudflare Dashboard (**Settings** → **Variables**) or via CLI, add the following:

**Environment Variables (Plain Text):**
- `STORE_NAME` = `Tuath Coir`
- `SUPPORT_EMAIL` = `support@tuathcoir.com`
- `NODE_ENV` = `production`

**Secrets (Encrypted):**
- `ADMIN_USERNAME` = `admin` (or your choice)
- `ADMIN_PASSWORD_HASH` = `[SHA-256 hash of your password]`
- `STRIPE_SECRET_KEY` = `[from Stripe dashboard]`
- `STRIPE_PUBLISHABLE_KEY` = `[from Stripe dashboard]`
- `STRIPE_WEBHOOK_SECRET` = `[from Stripe dashboard after Step 6]`
- `JWT_SECRET` = `[create a long random string for Phase 3]`
- `PRINTFUL_API_KEY` = `[from Printful settings]`
- `EPROLO_API_KEY` = `[from EPROLO settings]`
- `ZENDROP_API_KEY` = `[from Zendrop settings]`
- `FAIRE_API_TOKEN` = `[from Faire settings]`

> **Note:** Use `node scripts/generate-hash.js yourpassword` to generate the password hash.

### STEP 5: Connect Database Binding
1. In Cloudflare Worker settings → **Settings** → **Bindings**.
2. Click **Add Binding** → **D1 Database**.
3. Variable name: `DB`
4. D1 Database: Select `tuath_coir_db`.
5. **Save and Deploy**.

### STEP 6: Configure Webhooks

**Stripe:**
1. Stripe Dashboard → **Developers** → **Webhooks**.
2. URL: `https://tuath-coir-api.YOUR-USERNAME.workers.dev/api/webhooks/stripe`
3. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.dispute.created`.
4. Copy Signing Secret and add to `STRIPE_WEBHOOK_SECRET`.

**Printful:**
1. Printful Dashboard → **Settings** → **Webhooks**.
2. URL: `https://tuath-coir-api.YOUR-USERNAME.workers.dev/api/webhooks/printful`
3. Events: `package_shipped`, `order_failed` (Select "All" for full coverage).

### STEP 7: Deploy Worker
Run: `wrangler deploy`

---

## ✅ THE $0 TO LAUNCH CHECKLIST
- [ ] Database created and products inserted.
- [ ] Worker deployed and live.
- [ ] Printful account connected (templates made).
- [ ] EPROLO/Supplier products selected.
- [ ] Stripe account activated.
- [ ] Webhooks configured.
- [ ] Admin access working for Megan & Joy.
- [ ] Landing page live and visible.

---

## 📈 MARKETING EXECUTION (Your $0 Strategy)

### Week 1-2: Build Awareness
- Post 3x daily on TikTok/Reels: "Building Tuath Coir from scratch."
- Show product designs, supplier process, and the brand story.
- **Call to Action:** "Join the Tribe" → Link to your site.

### Week 3-4: Launch & Verify
- Launch the store.
- Perform a first $1 test order (buy from yourself).
- Verify the order flows to Printful/EPROLO correctly.
- Confirm money hits your bank account.

### Month 2+: Scale
- Scale winning content.
- Add new products based on what sells.
- Reinvest profit into inventory (if moving away from dropshipping later).

---

## 🛠️ Testing Endpoints
- **Landing Page:** `/`
- **The Initiation:** `/initiation`
- **Admin Dashboard:** `/admin`
- **Products API:** `/api/products`
- **Health Check:** `/health`
