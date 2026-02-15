/**
 * ═══════════════════════════════════════════════════════════════
 * TUATH COIR - COMPLETE E-COMMERCE PLATFORM
 * Phase 2: Payments + Admin + Order Management
 * ═══════════════════════════════════════════════════════════════
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    try {
      // ═══════════════════════════════════════════════════════
      // LANDING PAGE
      // ═══════════════════════════════════════════════════════
      if (path === '/' || path === '/home') {
        return new Response(getLandingPage(), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      // ═══════════════════════════════════════════════════════
      // PRODUCTS API
      // ═══════════════════════════════════════════════════════
      if (path === '/api/products' && request.method === 'GET') {
        return await handleGetProducts(request, env, headers);
      }

      if (path.startsWith('/api/products/') && request.method === 'GET') {
        return await handleGetSingleProduct(request, env, headers, path);
      }

      if (path === '/api/categories') {
        return await handleGetCategories(env, headers);
      }

      if (path === '/api/search') {
        return await handleSearch(request, env, headers);
      }

      // ═══════════════════════════════════════════════════════
      // ORDERS API
      // ═══════════════════════════════════════════════════════
      if (path === '/api/orders' && request.method === 'POST') {
        return await handleCreateOrder(request, env, headers);
      }

      if (path === '/api/orders' && request.method === 'GET') {
        return await handleGetOrders(request, env, headers);
      }

      if (path.startsWith('/api/orders/') && request.method === 'GET') {
        return await handleTrackOrder(request, env, headers, path);
      }

      // ═══════════════════════════════════════════════════════
      // PAYMENTS API
      // ═══════════════════════════════════════════════════════
      if (path === '/api/payment/create-intent' && request.method === 'POST') {
        return await handleCreatePaymentIntent(request, env, headers);
      }

      if (path === '/api/webhooks/stripe' && request.method === 'POST') {
        return await handleStripeWebhook(request, env, headers);
      }

      // ═══════════════════════════════════════════════════════
      // ADMIN DASHBOARD
      // ═══════════════════════════════════════════════════════
      if (path.startsWith('/admin')) {
        return await handleAdmin(request, env, headers, path);
      }

      // ═══════════════════════════════════════════════════════
      // HEALTH CHECK
      // ═══════════════════════════════════════════════════════
      if (path === '/health' || path === '/api/health') {
        return await handleHealth(env, headers);
      }

      return new Response(JSON.stringify({
        success: false,
        error: 'Endpoint not found'
      }), { status: 404, headers });

    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: env.NODE_ENV === 'development' ? error.message : undefined
      }), { status: 500, headers });
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// PRODUCT HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleGetProducts(request, env, headers) {
  const url = new URL(request.url);
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

  const products = results.map(p => ({
    ...p,
    images: p.images ? JSON.parse(p.images) : [],
    profit_margin: p.price > 0 ? ((p.price - p.cost_price) / p.price * 100).toFixed(1) + '%' : '0%'
  }));

  return new Response(JSON.stringify({
    success: true,
    count: products.length,
    products
  }, null, 2), { headers });
}

async function handleGetSingleProduct(request, env, headers, path) {
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
  product.profit_margin = product.price > 0 ? ((product.price - product.cost_price) / product.price * 100).toFixed(1) + '%' : '0%';

  return new Response(JSON.stringify({
    success: true,
    product
  }, null, 2), { headers });
}

async function handleGetCategories(env, headers) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM categories ORDER BY name'
  ).all();

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

async function handleSearch(request, env, headers) {
  const url = new URL(request.url);
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

// ═══════════════════════════════════════════════════════════════
// ORDER HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleCreateOrder(request, env, headers) {
  try {
    const orderData = await request.json();

    // Validate
    if (!orderData.items || !orderData.customer_email || !orderData.shipping_address) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), { status: 400, headers });
    }

    // Calculate totals
    let subtotal = 0;
    let totalCost = 0;
    const items = [];

    for (const item of orderData.items) {
      const product = await env.DB.prepare(
        'SELECT * FROM products WHERE id = ?'
      ).bind(item.product_id).first();

      if (!product) {
        return new Response(JSON.stringify({
          success: false,
          error: `Product ${item.product_id} not found`
        }), { status: 400, headers });
      }

      const itemSubtotal = product.price * item.quantity;
      const itemCost = product.cost_price * item.quantity;

      subtotal += itemSubtotal;
      totalCost += itemCost;

      items.push({
        product_id: product.id,
        sku: product.sku,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        cost_price: product.cost_price,
        supplier: product.supplier,
        supplier_product_id: product.supplier_product_id
      });
    }

    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + tax + shipping;
    const stripeFee = (total * 0.029) + 0.30;
    const profit = subtotal - totalCost - stripeFee;

    const orderNumber = 'TC' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

    const orderDetails = {
      order_number: orderNumber,
      customer_name: orderData.customer_name || '',
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone || '',
      shipping_address: orderData.shipping_address,
      items,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      profit: profit.toFixed(2),
      total_cost: totalCost.toFixed(2),
      created_at: new Date().toISOString()
    };

    // Save to database
    await env.DB.prepare(`
      INSERT INTO orders (
        order_number, customer_email, customer_name,
        shipping_address, order_data, total_amount, profit_amount,
        status, payment_status, fulfillment_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderNumber,
      orderData.customer_email,
      orderData.customer_name || '',
      JSON.stringify(orderData.shipping_address),
      JSON.stringify(orderDetails),
      total,
      profit,
      'pending_payment',
      'unpaid',
      'unfulfilled',
      orderDetails.created_at
    ).run();

    console.log(`Order created: ${orderNumber}`);

    return new Response(JSON.stringify({
      success: true,
      order_number: orderNumber,
      total: orderDetails.total,
      profit: orderDetails.profit,
      message: 'Order created successfully. Proceed to payment.'
    }), { status: 201, headers });

  } catch (error) {
    console.error('Order creation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create order',
      details: env.NODE_ENV === 'development' ? error.message : undefined
    }), { status: 500, headers });
  }
}

async function handleTrackOrder(request, env, headers, path) {
  const orderNumber = path.split('/')[3];

  if (!orderNumber) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Order number required'
    }), { status: 400, headers });
  }

  const order = await env.DB.prepare(
    'SELECT * FROM orders WHERE order_number = ?'
  ).bind(orderNumber).first();

  if (!order) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Order not found'
    }), { status: 404, headers });
  }

  const orderData = JSON.parse(order.order_data);

  return new Response(JSON.stringify({
    success: true,
    order: {
      order_number: order.order_number,
      customer_email: order.customer_email,
      status: order.status,
      payment_status: order.payment_status,
      fulfillment_status: order.fulfillment_status,
      tracking_number: order.tracking_number,
      tracking_url: order.tracking_url,
      total: order.total_amount,
      items: orderData.items,
      created_at: order.created_at,
      updated_at: order.updated_at
    }
  }, null, 2), { headers });
}

async function handleGetOrders(request, env, headers) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  let query = 'SELECT * FROM orders';
  const params = [];

  if (email) {
    query += ' WHERE customer_email = ?';
    params.push(email);
  }

  query += ' ORDER BY created_at DESC LIMIT 50';

  const stmt = params.length > 0
    ? env.DB.prepare(query).bind(...params)
    : env.DB.prepare(query);

  const { results } = await stmt.all();

  return new Response(JSON.stringify({
    success: true,
    orders: results
  }, null, 2), { headers });
}

// ═══════════════════════════════════════════════════════════════
// PAYMENT HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleCreatePaymentIntent(request, env, headers) {
  try {
    const { order_number, amount } = await request.json();

    if (!order_number || !amount) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order number and amount required'
      }), { status: 400, headers });
    }

    if (!env.STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment processing not configured'
      }), { status: 500, headers });
    }

    const order = await env.DB.prepare(
      'SELECT * FROM orders WHERE order_number = ?'
    ).bind(order_number).first();

    if (!order) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order not found'
      }), { status: 404, headers });
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(parseFloat(amount) * 100),
        currency: 'usd',
        'metadata[order_number]': order_number,
        'metadata[store]': 'Tuath Coir',
        'metadata[customer_email]': order.customer_email,
        'automatic_payment_methods[enabled]': 'true',
        'description': `Tuath Coir Order ${order_number}`
      })
    });

    const paymentIntent = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error('Stripe error:', paymentIntent);
      return new Response(JSON.stringify({
        success: false,
        error: paymentIntent.error?.message || 'Payment failed'
      }), { status: 400, headers });
    }

    await env.DB.prepare(`
      UPDATE orders
      SET stripe_payment_id = ?,
          updated_at = ?
      WHERE order_number = ?
    `).bind(paymentIntent.id, new Date().toISOString(), order_number).run();

    return new Response(JSON.stringify({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    }), { headers });

  } catch (error) {
    console.error('Payment intent error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create payment intent'
    }), { status: 500, headers });
  }
}

async function handleStripeWebhook(request, env, headers) {
  try {
    const event = await request.json();
    console.log('Stripe webhook received:', event.type);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const orderNumber = paymentIntent.metadata.order_number;

        if (orderNumber) {
          await env.DB.prepare(`
            UPDATE orders
            SET payment_status = 'paid',
                status = 'processing',
                updated_at = ?
            WHERE order_number = ?
          `).bind(new Date().toISOString(), orderNumber).run();
          console.log(`Order ${orderNumber} marked as paid`);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedOrderNumber = event.data.object.metadata.order_number;
        if (failedOrderNumber) {
          await env.DB.prepare(`
            UPDATE orders
            SET payment_status = 'failed',
                status = 'payment_failed',
                updated_at = ?
            WHERE order_number = ?
          `).bind(new Date().toISOString(), failedOrderNumber).run();
        }
        break;
    }

    return new Response(JSON.stringify({ received: true }), { headers });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), { status: 500, headers });
  }
}

// ═══════════════════════════════════════════════════════════════
// ADMIN HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleAdmin(request, env, headers, path) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { ...headers, 'WWW-Authenticate': 'Basic realm="Admin"', 'Content-Type': 'text/plain' }
    });
  }

  const credentials = atob(authHeader.split(' ')[1]);
  const [username, password] = credentials.split(':');

  const validUsername = env.ADMIN_USERNAME || 'admin';
  const hashedPassword = await hashPassword(password);

  if (!env.ADMIN_PASSWORD_HASH || username !== validUsername || hashedPassword !== env.ADMIN_PASSWORD_HASH) {
    return new Response('Forbidden', { status: 403, headers });
  }

  // Basic Admin Dashboard
  const { results: orders } = await env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100').all();

  let ordersHtml = orders.map(o => `
    <tr>
      <td style="padding:10px; border-bottom:1px solid #222;">${o.order_number}</td>
      <td style="padding:10px; border-bottom:1px solid #222;">${o.customer_email}</td>
      <td style="padding:10px; border-bottom:1px solid #222;">$${o.total_amount.toFixed(2)}</td>
      <td style="padding:10px; border-bottom:1px solid #222;">
        <span style="color:${o.payment_status === 'paid' ? '#00ff00' : '#ff0000'}">${o.payment_status.toUpperCase()}</span>
      </td>
      <td style="padding:10px; border-bottom:1px solid #222;">${o.status}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>TC ADMIN | Orders</title>
  <style>
    body { background:#000; color:#fff; font-family:sans-serif; padding:40px; }
    h1 { letter-spacing:10px; border-bottom:3px solid #fff; padding-bottom:10px; }
    table { width:100%; border-collapse:collapse; margin-top:20px; }
    th { text-align:left; background:#111; padding:10px; letter-spacing:2px; font-size:12px; }
  </style>
</head>
<body>
  <h1>TUATH COIR ADMIN</h1>
  <table>
    <thead>
      <tr>
        <th>ORDER #</th>
        <th>CUSTOMER</th>
        <th>TOTAL</th>
        <th>PAYMENT</th>
        <th>STATUS</th>
      </tr>
    </thead>
    <tbody>
      ${ordersHtml || '<tr><td colspan="5" style="text-align:center; padding:20px;">No orders yet</td></tr>'}
    </tbody>
  </table>
</body>
</html>`;

  return new Response(html, { headers: { ...headers, 'Content-Type': 'text/html' } });
}

// ═══════════════════════════════════════════════════════════════
// HELPERS & HEALTH
// ═══════════════════════════════════════════════════════════════

async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handleHealth(env, headers) {
  const dbCheck = await env.DB.prepare('SELECT COUNT(*) as count FROM products').first();
  return new Response(JSON.stringify({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: { connected: true, products: dbCheck.count },
    version: '2.0.0-phase2'
  }, null, 2), { headers });
}

function getLandingPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TUATH COIR | Ancient Celtic Roots. Street Justice.</title>
    <style>
        body { background: #000; color: #fff; font-family: 'Arial Black', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; margin:0; }
        .logo { border: 3px solid #fff; width: 80px; height: 80px; line-height: 80px; font-size: 32px; margin: 0 auto 20px; }
        h1 { letter-spacing: 12px; font-size: 24px; color: #ddd; margin-bottom: 10px; }
        .tagline { color: #666; letter-spacing: 3px; font-size: 12px; margin-bottom: 40px; }
        .btn { background: #fff; color: #000; padding: 15px 30px; border: none; font-weight: bold; cursor: pointer; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; }
    </style>
</head>
<body>
    <div>
        <div class="logo">TC</div>
        <h1>TUATH COIR</h1>
        <p class="tagline">ANCIENT CELTIC ROOTS. STREET JUSTICE.</p>
        <a href="/api/products" class="btn">VIEW PRODUCTS</a>
    </div>
</body>
</html>`;
}
