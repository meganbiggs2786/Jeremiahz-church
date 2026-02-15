# DEPLOYMENT GUIDE - TUATH COIR

## Prerequisites

1. **Cloudflare Account** (free tier)
   - Sign up at: https://dash.cloudflare.com/sign-up

2. **Node.js 18+**
   - Check: `node --version`
   - Install from: https://nodejs.org

3. **Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

## Step-by-Step Deployment

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR-USERNAME/tuath-coir.git
cd tuath-coir
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This opens a browser for authentication.

### Step 3: Create D1 Database

```bash
wrangler d1 create tuath_coir_db
```

**Important:** Copy the `database_id` from the output.

Example output:
```
✅ Successfully created DB 'tuath_coir_db'

[[d1_databases]]
binding = "DB"
database_name = "tuath_coir_db"
database_id = "abc123-def456-ghi789"  ← COPY THIS
```

### Step 4: Update wrangler.toml

Open `wrangler.toml` and replace `YOUR_DATABASE_ID_HERE` with the ID from Step 3.

```toml
[[ d1_databases ]]
binding = "DB"
database_name = "tuath_coir_db"
database_id = "abc123-def456-ghi789"  # ← YOUR ID HERE
```

### Step 5: Create Database Tables

```bash
wrangler d1 execute tuath_coir_db --file=database/schema.sql
```

Expected output:
```
🌀 Executing on tuath_coir_db (abc123-def456-ghi789):
🌀 To execute on your remote database, add a --remote flag to your wrangler command.
✅ Success!
```

### Step 6: Seed Database with Products

```bash
wrangler d1 execute tuath_coir_db --file=database/seed.sql
```

Expected output:
```
✅ 12 rows inserted
```

### Step 7: Deploy Worker

```bash
wrangler deploy
```

Expected output:
```
⛅️ wrangler 3.x.x
------------------
Your worker has been deployed:
🌏 https://tuath-coir-api.YOUR-ACCOUNT.workers.dev
```

### Step 8: Test Deployment

Visit your Worker URL:
```
https://tuath-coir-api.YOUR-ACCOUNT.workers.dev
```

**Test endpoints:**

1. Landing page:
   ```
   https://tuath-coir-api.YOUR-ACCOUNT.workers.dev/
   ```

2. Products API:
   ```
   https://tuath-coir-api.YOUR-ACCOUNT.workers.dev/api/products
   ```

3. Health check:
   ```
   https://tuath-coir-api.YOUR-ACCOUNT.workers.dev/health
   ```

## Troubleshooting

### Issue: "Database not found"

**Solution:**
```bash
# List your databases
wrangler d1 list

# Verify database_id in wrangler.toml matches
```

### Issue: "Worker deployed but shows error"

**Solution:**
```bash
# Check logs
wrangler tail

# Verify database binding
wrangler d1 info tuath_coir_db
```

### Issue: "Cannot find module"

**Solution:**
Make sure you're in the project root directory:
```bash
pwd  # Should show: /path/to/tuath-coir
ls   # Should show: wrangler.toml, worker/, database/
```

## Environment Variables

**Phase 1:** No environment variables needed.

**Phase 2:** Will add these via Cloudflare dashboard:
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `STRIPE_SECRET_KEY`
- `PRINTFUL_API_KEY`
- `EPROLO_API_KEY`

## Updating the Worker

After making changes:

```bash
# Deploy updates
wrangler deploy

# View live logs
wrangler tail
```

## Rolling Back

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback [deployment-id]
```

## Local Development

```bash
# Run locally
wrangler dev

# Access at: http://localhost:8787
```

## Production Checklist

Before going live:

- [ ] Database deployed and seeded
- [ ] Worker deployed successfully
- [ ] All API endpoints tested
- [ ] Health check returns "OK"
- [ ] Products load correctly
- [ ] Custom domain configured (optional)

## Custom Domain (Optional)

1. Add domain in Cloudflare dashboard
2. Go to Workers & Pages → tuath-coir-api → Settings
3. Add custom domain: `api.tuathcoir.com`
4. Update DNS records as instructed

## Support

For issues, contact project maintainers or check:
- Cloudflare Workers docs: https://developers.cloudflare.com/workers/
- D1 Database docs: https://developers.cloudflare.com/d1/

## Next Steps

After successful deployment:
- Proceed to Phase 2: Payments & Admin Dashboard
- Set up Stripe account
- Configure supplier APIs (Printful, EPROLO)
