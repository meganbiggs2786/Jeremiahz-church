# TUATH COIR - ARCHITECTURE

## Overview
Tuath Coir is a serverless e-commerce backend built on Cloudflare's global edge network. It uses a "Just-in-Time" fulfillment model to minimize upfront costs and inventory risk.

## Current Phase: Phase 2
The platform now supports order creation, secure payment processing with Stripe, and an administrative dashboard for order management.

## Technology Stack
- **Compute:** Cloudflare Workers (V8 Runtime)
- **Database:** Cloudflare D1 (SQLite at the edge)
- **Language:** JavaScript (ES6 Modules)

## System Components

### 1. API Layer (Cloudflare Workers)
Handles HTTP requests, implements business logic, and interacts with the database. Deployed to 300+ locations globally for ultra-low latency.

### 2. Data Layer (Cloudflare D1)
Relational database storing products, categories, and orders. Provides ACID compliance and SQL querying capabilities.

### 3. Fulfillment Integrations (Phase 2B+)
- **Printful:** Print-on-demand for apparel.
- **EPROLO/Zendrop:** Dropshipping for grooming products.
- **Faire:** Wholesale/Artisan sourcing for bath products.

### 4. Payment Gateway (Phase 2A)
- **Stripe:** Secure payment processing via Payment Intents and Webhooks.

## Data Flow
1. **Request:** Client requests `/api/products`.
2. **Compute:** Worker receives request, validates parameters.
3. **Data:** Worker queries D1 database for active products.
4. **Logic:** Worker calculates profit margins and formats JSON.
5. **Response:** Worker returns JSON to client with CORS headers.

## Security
- CORS protection for API endpoints.
- Environment variables for sensitive API keys.
- SQL parameter binding to prevent injection.
