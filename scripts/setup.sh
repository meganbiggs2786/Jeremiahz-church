#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# TUATH COIR - INITIAL SETUP SCRIPT
# ═══════════════════════════════════════════════════════════════

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║         TUATH COIR - INITIAL SETUP                     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    echo "📦 Install from: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required (you have: $(node -v))"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo ""

# Install Wrangler
echo "Installing Wrangler CLI..."
npm install -g wrangler

echo "✅ Wrangler installed"
echo ""

# Login to Cloudflare
echo "🔑 Logging in to Cloudflare..."
wrangler login

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║              SETUP COMPLETE!                           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next steps:"
echo "  1. Run: bash scripts/deploy.sh"
echo "  2. Follow the prompts to deploy"
echo ""
