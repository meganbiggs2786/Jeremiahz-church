/**
 * ═══════════════════════════════════════════════════════════════
 * TUATH COIR - E-COMMERCE API
 * Phase 1: Foundation
 * ═══════════════════════════════════════════════════════════════
 *
 * Ancient Celtic Roots. Street Justice.
 *
 * Owners: Megan & Joy
 * Business Model: Pay suppliers only after customer pays
 *
 * Technology:
 * - Cloudflare Workers (Serverless API)
 * - D1 Database (SQLite)
 * - Edge deployment (global)
 *
 * Products:
 * - Irish Apparel (Printful POD)
 * - Men's Hygiene (EPROLO Dropshipping)
 * - Handmade Bath (Faire Artisan)
 * - High-Profit Bundles
 * ═══════════════════════════════════════════════════════════════
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for all responses
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    try {

      // ═══════════════════════════════════════════════════════
      // HOME - Landing Page
      // ═══════════════════════════════════════════════════════

      if (path === '/' || path === '/home') {
        return new Response(getLandingPage(), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      // ═══════════════════════════════════════════════════════
      // API - Get All Products
      // ═══════════════════════════════════════════════════════

      if (path === '/api/products' && request.method === 'GET') {
        const category = url.searchParams.get('category');

        let query = 'SELECT * FROM products WHERE is_active = 1';
        const params = [];

        if (category) {
          query += ' AND category = ?';
          params.push(category);
        }

        query += ' ORDER BY created_at DESC';

        const stmt = params.length > 0
          ? env.DB.prepare(query).bind(...params)
          : env.DB.prepare(query);

        const { results } = await stmt.all();

        // Parse JSON fields
        const products = results.map(p => ({
          ...p,
          images: p.images ? JSON.parse(p.images) : [],
          profit_margin: ((p.price - p.cost_price) / p.price * 100).toFixed(1) + '%'
        }));

        return new Response(JSON.stringify({
          success: true,
          count: products.length,
          products,
          filters: { category }
        }, null, 2), { headers });
      }

      // ═══════════════════════════════════════════════════════
      // API - Get Single Product
      // ═══════════════════════════════════════════════════════

      if (path.startsWith('/api/products/') && request.method === 'GET') {
        const id = parseInt(path.split('/')[3]);

        if (isNaN(id)) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Invalid product ID'
          }), { status: 400, headers });
        }

        const product = await env.DB.prepare(
          'SELECT * FROM products WHERE id = ? AND is_active = 1'
        ).bind(id).first();

        if (!product) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Product not found'
          }), { status: 404, headers });
        }

        product.images = product.images ? JSON.parse(product.images) : [];
        product.profit_margin = ((product.price - product.cost_price) / product.price * 100).toFixed(1) + '%';

        return new Response(JSON.stringify({
          success: true,
          product
        }, null, 2), { headers });
      }

      // ═══════════════════════════════════════════════════════
      // API - Get Categories
      // ═══════════════════════════════════════════════════════

      if (path === '/api/categories' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM categories ORDER BY name'
        ).all();

        // Get product count per category
        const categoriesWithCount = await Promise.all(
          results.map(async (cat) => {
            const count = await env.DB.prepare(
              'SELECT COUNT(*) as count FROM products WHERE category = ? AND is_active = 1'
            ).bind(cat.name).first();

            return {
              ...cat,
              product_count: count.count
            };
          })
        );

        return new Response(JSON.stringify({
          success: true,
          categories: categoriesWithCount
        }, null, 2), { headers });
      }

      // ═══════════════════════════════════════════════════════
      // API - Search Products
      // ═══════════════════════════════════════════════════════

      if (path === '/api/search' && request.method === 'GET') {
        const searchTerm = url.searchParams.get('q');

        if (!searchTerm) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Search term required'
          }), { status: 400, headers });
        }

        const { results } = await env.DB.prepare(`
          SELECT * FROM products
          WHERE is_active = 1
          AND (name LIKE ? OR description LIKE ?)
          ORDER BY name
        `).bind(`%${searchTerm}%`, `%${searchTerm}%`).all();

        const products = results.map(p => ({
          ...p,
          images: p.images ? JSON.parse(p.images) : []
        }));

        return new Response(JSON.stringify({
          success: true,
          query: searchTerm,
          count: products.length,
          products
        }, null, 2), { headers });
      }

      // ═══════════════════════════════════════════════════════
      // API - Health Check
      // ═══════════════════════════════════════════════════════

      if (path === '/health' || path === '/api/health') {
        const dbCheck = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM products'
        ).first();

        return new Response(JSON.stringify({
          status: 'OK',
          timestamp: new Date().toISOString(),
          database: {
            connected: true,
            products: dbCheck.count
          },
          environment: env.NODE_ENV || 'development',
          version: '1.0.0-phase1'
        }, null, 2), { headers });
      }

      // ═══════════════════════════════════════════════════════
      // 404 - Not Found
      // ═══════════════════════════════════════════════════════

      return new Response(JSON.stringify({
        success: false,
        error: 'Endpoint not found',
        path: path,
        available_endpoints: {
          home: 'GET /',
          products: 'GET /api/products',
          single_product: 'GET /api/products/:id',
          categories: 'GET /api/categories',
          search: 'GET /api/search?q=term',
          health: 'GET /health'
        }
      }, null, 2), {
        status: 404,
        headers
      });

    } catch (error) {
      console.error('Server Error:', error);

      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message,
        path: path
      }, null, 2), {
        status: 500,
        headers
      });
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// LANDING PAGE HTML
// ═══════════════════════════════════════════════════════════════

function getLandingPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Tuath Coir - Irish-inspired apparel, men's grooming, and handmade bath products. Ancient Celtic roots meet modern street justice.">
    <title>TUATH COIR | Ancient Celtic Roots. Street Justice.</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #000;
            color: #fff;
            font-family: 'Arial Black', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            width: 100%;
        }

        .logo {
            border: 3px solid #fff;
            width: 80px;
            height: 80px;
            line-height: 80px;
            font-size: 32px;
            margin: 0 auto 20px;
            display: inline-block;
            transition: all 0.3s;
        }

        .logo:hover {
            border-color: #006400;
            color: #FFD700;
        }

        h1 {
            letter-spacing: 12px;
            font-size: clamp(18px, 5vw, 24px);
            color: #ddd;
            margin-bottom: 10px;
        }

        .tagline {
            color: #666;
            letter-spacing: 3px;
            font-size: clamp(10px, 3vw, 12px);
            margin-bottom: 40px;
        }

        .btn-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }

        .btn {
            background: #fff;
            color: #000;
            padding: 15px 30px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            letter-spacing: 2px;
            text-transform: uppercase;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-block;
            font-size: 14px;
        }

        .btn:hover {
            background: #006400;
            color: #FFD700;
        }

        .btn-secondary {
            background: transparent;
            border: 2px solid #fff;
            color: #fff;
        }

        .btn-secondary:hover {
            background: #FFD700;
            border-color: #FFD700;
            color: #000;
        }

        .footer {
            color: #333;
            font-size: 10px;
            margin-top: 40px;
            letter-spacing: 2px;
        }

        .api-section {
            margin-top: 60px;
            padding-top: 40px;
            border-top: 1px solid #222;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #00ff00;
            text-align: left;
        }

        .api-section h3 {
            color: #00ff00;
            margin-bottom: 15px;
            letter-spacing: 2px;
            text-align: center;
        }

        .endpoint {
            background: #0d0d0d;
            border: 1px solid #00ff00;
            padding: 10px;
            margin: 5px 0;
            border-radius: 3px;
            font-size: 10px;
        }

        .status {
            background: #001a00;
            border: 1px solid #00ff00;
            padding: 15px;
            margin-top: 20px;
            border-radius: 3px;
        }

        .status-item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
        }

        @media (max-width: 600px) {
            h1 {
                letter-spacing: 8px;
            }
            .tagline {
                letter-spacing: 2px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">TC</div>
        <h1>TUATH COIR</h1>
        <p class="tagline">ANCIENT CELTIC ROOTS. STREET JUSTICE.</p>

        <div class="btn-group">
            <a href="/api/products" class="btn">VIEW PRODUCTS</a>
            <a href="/api/categories" class="btn btn-secondary">CATEGORIES</a>
        </div>

        <p class="footer">
            IRISH APPAREL • MEN'S GROOMING • HANDMADE QUALITY
        </p>

        <div class="api-section">
            <h3>⚡ API ENDPOINTS</h3>
            <div class="endpoint">GET /api/products → List all products</div>
            <div class="endpoint">GET /api/products/:id → Single product details</div>
            <div class="endpoint">GET /api/categories → Product categories</div>
            <div class="endpoint">GET /api/search?q=term → Search products</div>
            <div class="endpoint">GET /health → System health check</div>

            <div class="status">
                <div class="status-item">
                    <span>STATUS:</span>
                    <span style="color:#00ff00;">● ONLINE</span>
                </div>
                <div class="status-item">
                    <span>DATABASE:</span>
                    <span style="color:#00ff00;">● CONNECTED</span>
                </div>
                <div class="status-item">
                    <span>PHASE:</span>
                    <span>1 - FOUNDATION ✓</span>
                </div>
                <div class="status-item">
                    <span>PRODUCTS:</span>
                    <span>12 LOADED</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}
