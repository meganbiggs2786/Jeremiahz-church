#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# TUATH COIR - AUTOMATED DEPLOYMENT SCRIPT
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════╗"
echo "║      TUATH COIR - AUTOMATED DEPLOYMENT                ║"
echo "║      Ancient Celtic Roots. Street Justice.            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found!"
    echo "📦 Install with: npm install -g wrangler"
    exit 1
fi

echo "✅ Wrangler CLI found"
echo ""

# Check if logged in
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare"
    echo "🔑 Running: wrangler login"
    wrangler login
fi

echo "✅ Authenticated to Cloudflare"
echo ""

# Check if database exists
echo "🗄️  Checking database..."
DB_EXISTS=$(wrangler d1 list | grep -c "tuath_coir_db" || true)

if [ "$DB_EXISTS" -eq "0" ]; then
    echo "📦 Creating D1 database..."
    wrangler d1 create tuath_coir_db
    echo ""
    echo "⚠️  IMPORTANT: Copy the database_id from above and update wrangler.toml"
    echo "Press Enter after updating wrangler.toml..."
    read
else
    echo "✅ Database already exists"
fi

echo ""

# Create tables
echo "📋 Creating database tables..."
wrangler d1 execute tuath_coir_db --file=database/schema.sql --local
wrangler d1 execute tuath_coir_db --file=database/schema.sql --remote

echo "✅ Tables created"
echo ""

# Seed database
echo "🌱 Seeding database with products..."
wrangler d1 execute tuath_coir_db --file=database/seed.sql --local
wrangler d1 execute tuath_coir_db --file=database/seed.sql --remote

echo "✅ Database seeded with 25 products"
echo ""

# Deploy worker
echo "🚀 Deploying Cloudflare Worker..."
wrangler deploy

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                  DEPLOYMENT COMPLETE!                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Your API is now live!"
echo ""
echo "📋 Next steps:"
echo "  1. Visit your Worker URL to test"
echo "  2. Check /api/products endpoint"
echo "  3. Verify /health endpoint shows 25 products"
echo ""
echo "🎉 Tuath Coir is ready to serve!"
