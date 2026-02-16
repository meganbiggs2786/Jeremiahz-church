/**
 * ═══════════════════════════════════════════════════════════════
 * TUATH COIR - COMPLETE E-COMMERCE PLATFORM
 * Phase 2: Payments + Admin + Order Management
 * Brand Concept: Tuath Coir Territories
 * Aesthetic: Ancient Celtic Roots + Urban Streetwear (Sword/Knot motif)
 * ═══════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════
// RATE LIMITER
// ═══════════════════════════════════════════════════════════════

const rateLimiter = {
  // Note: Memory is per-isolate. For global rate limiting, use Cloudflare KV.
  requests: new Map(),

  async check(ip) {
    if (!ip) return true; // Skip if no IP (local testing)

    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 100; // 100 requests per minute

    if (!this.requests.has(ip)) {
      this.requests.set(ip, []);
    }

    const requests = this.requests.get(ip);

    // Remove old requests outside window
    const recent = requests.filter(time => now - time < windowMs);

    if (recent.length >= maxRequests) {
      return false; // Rate limit exceeded
    }

    recent.push(now);
    this.requests.set(ip, recent);
    return true; // Allowed
  }
};

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createContext } from './trpc';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle tRPC
    if (path.startsWith('/trpc')) {
      return fetchRequestHandler({
        endpoint: '/trpc',
        req: request,
        router: appRouter,
        createContext: ({ req, resHeaders }) => createContext({ req, resHeaders, env }),
      });
    }

    // GAP 5: Force HTTPS in production
    if (url.protocol !== 'https:' && env.NODE_ENV === 'production') {
      return Response.redirect('https://' + url.hostname + url.pathname, 301);
    }

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // Apply Rate Limiting
    const clientIP = request.headers.get('CF-Connecting-IP');
    const allowed = await rateLimiter.check(clientIP);

    if (!allowed) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Too many requests. Please slow down.'
      }), {
        status: 429,
        headers
      });
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

      if (path === '/initiation' && request.method === 'GET') {
        return new Response(getInitiationPage(), {
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
        let orderData;
        try {
          orderData = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON data' }), { status: 400, headers });
        }

        const errors = [];
        if (!orderData.customer_email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          errors.push('Invalid email address');
        }
        if (!orderData.shipping_address?.postal_code) {
          errors.push('Missing postal code');
        }
        if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
          errors.push('Order must contain at least one item');
        }
        orderData.items?.forEach((item, index) => {
          if (!Number.isInteger(item.product_id) || item.product_id <= 0) {
            errors.push(`Invalid product_id at item ${index}`);
          }
          if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) {
            errors.push(`Invalid quantity at item ${index} (must be 1-999)`);
          }
        });

        if (errors.length > 0) {
          return new Response(JSON.stringify({ error: 'Validation failed', details: errors }), { status: 400, headers });
        }

        orderData.customer_name = orderData.customer_name?.replace(/[<>]/g, '').trim();
        orderData.customer_email = orderData.customer_email?.toLowerCase().trim();

        return await handleCreateOrder(request, env, headers, orderData);
      }

      if (path === '/api/orders' && request.method === 'GET') {
        return await handleGetOrders(request, env, headers);
      }

      // ═══════════════════════════════════════════════════════
      // INITIATION API
      // ═══════════════════════════════════════════════════════
      if (path === '/api/initiation' && request.method === 'POST') {
        return await handleInitiation(request, env, headers);
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
        return await handleStripeWebhook(request, env, ctx, headers);
      }

      if (path === '/api/webhooks/printful' && request.method === 'POST') {
        return await handlePrintfulWebhook(request, env, headers);
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
      // SECURITY LAYER 6: SAFE ERROR HANDLING
      console.error('Server error:', error);

      const errorResponse = {
        success: false,
        error: 'An unexpected error occurred',
        request_id: crypto.randomUUID()
      };

      if (env.NODE_ENV === 'development') {
        errorResponse.debug = {
          message: error.message,
          stack: error.stack
        };
      }

      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
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

async function handleCreateOrder(request, env, headers, orderData) {
  try {

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

    // Log activity
    await env.DB.prepare(
      'INSERT INTO activity_logs (action, description, created_at) VALUES (?, ?, ?)'
    ).bind('order_created', `New order ${orderNumber} created ($${total.toFixed(2)})`, new Date().toISOString()).run();

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

async function handleInitiation(request, env, headers) {
  try {
    const data = await request.json();
    const { name, email, territory, signature } = data;

    if (!name || !email || !territory || !signature) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Incomplete initiation. All fields required.'
      }), { status: 400, headers });
    }

    // Basic email check
    if (!email.includes('@')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid messenger details (email).'
      }), { status: 400, headers });
    }

    // Save member
    await env.DB.prepare(`
      INSERT INTO members (name, email, territory, oath_version)
      VALUES (?, ?, ?, ?)
    `).bind(name, email, territory, 'v1-initiation').run();

    // Log activity
    await env.DB.prepare(
      'INSERT INTO activity_logs (action, description, created_at) VALUES (?, ?, ?)'
    ).bind('new_member', `${name} joined the ${territory} Territory`, new Date().toISOString()).run();

    console.log(`New initiate: ${name} in ${territory}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Initiation complete. Welcome to the ${territory} Territory, ${name}.`,
      tribe: 'Tuath Coir'
    }), { status: 201, headers });

  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'You have already taken the oath.'
      }), { status: 400, headers });
    }
    console.error('Initiation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Initiation failed. The tribe awaits your return.'
    }), { status: 500, headers });
  }
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

async function handleStripeWebhook(request, env, ctx, headers) {
  try {
    const signature = request.headers.get('stripe-signature');
    const body = await request.text();

    if (env.STRIPE_WEBHOOK_SECRET && !await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET)) {
      console.error('Invalid Stripe signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400, headers });
    }

    const event = JSON.parse(body);
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

          // Trigger Auto-fulfillment
          const order = await env.DB.prepare(
            'SELECT * FROM orders WHERE order_number = ?'
          ).bind(orderNumber).first();

          if (order) {
            ctx.waitUntil(fulfillOrder(JSON.parse(order.order_data), env));
          }
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
// AUTO-FULFILLMENT HANDLERS
// ═══════════════════════════════════════════════════════════════

async function fulfillOrder(order, env) {
  const items = order.items || [];

  // Group items by supplier
  const supplierGroups = items.reduce((acc, item) => {
    if (!acc[item.supplier]) acc[item.supplier] = [];
    acc[item.supplier].push(item);
    return acc;
  }, {});

  console.log(`Fulfilling order ${order.order_number} across ${Object.keys(supplierGroups).length} suppliers`);

  // Send to Printful
  if (supplierGroups.Printful?.length > 0 && env.PRINTFUL_API_KEY) {
    await sendToPrintful(order, supplierGroups.Printful, env);
  }

  // Send to EPROLO
  if (supplierGroups.EPROLO?.length > 0 && env.EPROLO_API_KEY) {
    await sendToEprolo(order, supplierGroups.EPROLO, env);
  }

  // Send to Zendrop
  if (supplierGroups.Zendrop?.length > 0 && env.ZENDROP_API_KEY) {
    await sendToZendrop(order, supplierGroups.Zendrop, env);
  }
}

async function sendToPrintful(order, items, env) {
  try {
    const response = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        external_id: order.order_number,
        recipient: {
          name: order.customer_name,
          address1: order.shipping_address.line1,
          city: order.shipping_address.city,
          state_code: order.shipping_address.state,
          country_code: 'US',
          zip: order.shipping_address.postal_code,
          email: order.customer_email
        },
        items: items.map(item => ({
          sync_variant_id: item.supplier_product_id,
          quantity: item.quantity
        }))
      })
    });

    const result = await response.json();
    console.log('Printful response:', JSON.stringify(result));
  } catch (error) {
    console.error('Printful error:', error);
  }
}

async function sendToEprolo(order, items, env) {
  try {
    const response = await fetch('https://api.eprolo.com/api/order/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.EPROLO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderNum: order.order_number,
        consignee: order.customer_name,
        address: order.shipping_address.line1,
        city: order.shipping_address.city,
        province: order.shipping_address.state,
        country: 'US',
        zipCode: order.shipping_address.postal_code,
        email: order.customer_email,
        products: items.map(item => ({
          productId: item.supplier_product_id,
          quantity: item.quantity
        }))
      })
    });
    const result = await response.json();
    console.log('EPROLO response:', JSON.stringify(result));
  } catch (error) {
    console.error('EPROLO error:', error);
  }
}

async function sendToZendrop(order, items, env) {
  console.log(`Manual fulfillment required for Zendrop items in order ${order.order_number}`);
}

async function handlePrintfulWebhook(request, env, headers) {
  try {
    const event = await request.json();
    console.log('Printful webhook:', event.type);

    if (event.type === 'package_shipped') {
      const orderNumber = event.data.order.external_id;
      const trackingNumber = event.data.shipment.tracking_number;
      const trackingUrl = event.data.shipment.tracking_url;

      await env.DB.prepare(`
        UPDATE orders
        SET fulfillment_status = 'shipped',
            tracking_number = ?,
            tracking_url = ?,
            updated_at = ?
        WHERE order_number = ?
      `).bind(trackingNumber, trackingUrl, new Date().toISOString(), orderNumber).run();

      console.log(`Order ${orderNumber} marked as shipped with tracking ${trackingNumber}`);
    }

    return new Response(JSON.stringify({ received: true }), { headers });
  } catch (error) {
    console.error('Printful webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook failed' }), { status: 500, headers });
  }
}

// ═══════════════════════════════════════════════════════════════
// ADMIN AUTHENTICATION & DASHBOARD
// ═══════════════════════════════════════════════════════════════

async function handleAdmin(request, env, headers, path) {
  // Check authentication
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new Response(getAdminLogin(), {
      status: 401,
      headers: {
        'Content-Type': 'text/html',
        'WWW-Authenticate': 'Basic realm="Tuath Coir Admin"'
      }
    });
  }

  // Verify credentials
  const credentials = atob(authHeader.split(' ')[1]);
  const [username, password] = credentials.split(':');

  const validUsername = env.ADMIN_USERNAME || 'admin';
  const hashedPassword = await hashPassword(password);

  if (!env.ADMIN_PASSWORD_HASH ||
      username !== validUsername ||
      hashedPassword !== env.ADMIN_PASSWORD_HASH) {
    return new Response(getAdminLogin(true), {
      status: 401,
      headers: {
        'Content-Type': 'text/html',
        'WWW-Authenticate': 'Basic realm="Tuath Coir Admin"'
      }
    });
  }

  // Get dashboard stats
  const stats = await getAdminStats(env);

  // Return dashboard
  return new Response(getAdminDashboard(stats, env), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

async function getAdminStats(env) {
  try {
    // All-time stats
    const allTime = await env.DB.prepare(`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(profit_amount), 0) as total_profit
      FROM orders
      WHERE payment_status = 'paid'
    `).first();

    // Today's stats
    const today = await env.DB.prepare(`
      SELECT
        COUNT(*) as today_orders,
        COALESCE(SUM(total_amount), 0) as today_revenue,
        COALESCE(SUM(profit_amount), 0) as today_profit
      FROM orders
      WHERE DATE(created_at) = DATE('now')
      AND payment_status = 'paid'
    `).first();

    // Recent orders
    const { results: recentOrders } = await env.DB.prepare(`
      SELECT
        order_number,
        customer_email,
        customer_name,
        total_amount,
        profit_amount,
        status,
        payment_status,
        fulfillment_status,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    // This week stats
    const week = await env.DB.prepare(`
      SELECT
        COUNT(*) as week_orders,
        COALESCE(SUM(total_amount), 0) as week_revenue,
        COALESCE(SUM(profit_amount), 0) as week_profit
      FROM orders
      WHERE DATE(created_at) >= DATE('now', '-7 days')
      AND payment_status = 'paid'
    `).first();

    // Pending orders (Unpaid)
    const pending = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM orders WHERE payment_status = 'unpaid'
    `).first();

    return {
      total_orders: allTime.total_orders || 0,
      total_revenue: (allTime.total_revenue || 0).toFixed(2),
      total_profit: (allTime.total_profit || 0).toFixed(2),
      today_orders: today.today_orders || 0,
      today_revenue: (today.today_revenue || 0).toFixed(2),
      today_profit: (today.today_profit || 0).toFixed(2),
      week_orders: week.week_orders || 0,
      week_revenue: (week.week_revenue || 0).toFixed(2),
      week_profit: (week.week_profit || 0).toFixed(2),
      pending_orders: pending.count || 0,
      recent_orders: recentOrders
    };
  } catch (error) {
    console.error('Stats error:', error);
    return {
      total_orders: 0,
      total_revenue: '0.00',
      total_profit: '0.00',
      today_orders: 0,
      today_revenue: '0.00',
      today_profit: '0.00',
      week_orders: 0,
      week_revenue: '0.00',
      week_profit: '0.00',
      pending_orders: 0,
      recent_orders: []
    };
  }
}

function getAdminLogin(failed = false) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tuath Coir | Admin Login</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #000;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
        }
        .login-box {
            border: 2px solid #00ff00;
            padding: 40px;
            background: #0a0a0a;
            max-width: 400px;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
        }
        h1 {
            color: #FFD700;
            letter-spacing: 3px;
            margin-bottom: 20px;
            font-size: 24px;
        }
        .error {
            color: #ff0000;
            margin: 20px 0;
            padding: 10px;
            border: 1px solid #ff0000;
            background: rgba(255, 0, 0, 0.1);
        }
        p {
            color: #666;
            margin: 20px 0;
            line-height: 1.6;
        }
        .logo {
            font-size: 48px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="login-box">
        <div class="logo">⚔️</div>
        <h1>TUATH COIR</h1>
        <p>ADMIN COMMAND CENTER</p>
        ${failed ? '<p class="error">❌ INVALID CREDENTIALS<br>Access Denied</p>' : ''}
        <p>Enter your credentials to access the dashboard.</p>
        <p style="font-size: 10px; margin-top: 30px;">Protected Area • Megan & Joy Only</p>
    </div>
</body>
</html>`;
}

function getAdminDashboard(stats, env) {
  const avgOrderValue = stats.total_orders > 0
    ? (parseFloat(stats.total_revenue) / stats.total_orders).toFixed(2)
    : '0.00';

  const profitMargin = parseFloat(stats.total_revenue) > 0
    ? ((parseFloat(stats.total_profit) / parseFloat(stats.total_revenue)) * 100).toFixed(1)
    : '0.0';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tuath Coir | Admin Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #0a0a0a;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            padding: 20px;
            line-height: 1.6;
        }
        .header {
            border-bottom: 2px solid #00ff00;
            padding-bottom: 15px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }
        h1 { color: #FFD700; letter-spacing: 4px; font-size: 24px; }
        .timestamp { color: #666; font-size: 12px; text-align: right; }

        .alert {
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid #FFD700;
            color: #FFD700;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 3px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .panel {
            border: 1px solid #00ff00;
            padding: 20px;
            background: #0d0d0d;
            border-radius: 3px;
            box-shadow: 0 0 10px rgba(0, 255, 0, 0.1);
        }
        .panel h3 {
            color: #00ff00;
            margin-bottom: 15px;
            font-size: 14px;
            letter-spacing: 2px;
            border-bottom: 1px solid #1a1a1a;
            padding-bottom: 10px;
        }

        .stat {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #1a1a1a;
        }
        .stat:last-child { border-bottom: none; }
        .stat-label { color: #666; font-size: 12px; }
        .stat-value { color: #00ff00; font-weight: bold; font-size: 14px; }
        .stat-value.profit { color: #FFD700; }
        .stat-value.warning { color: #ff9900; }

        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 2px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-paid { background: #003300; color: #00ff00; border: 1px solid #00ff00; }
        .status-unpaid { background: #330000; color: #ff6666; border: 1px solid #ff0000; }
        .status-processing { background: #333300; color: #ffff00; border: 1px solid #ffff00; }
        .status-shipped { background: #003366; color: #66ccff; border: 1px solid #0099ff; }

        .integration-status {
            padding: 2px 6px;
            font-size: 9px;
            font-weight: bold;
            border-radius: 2px;
        }
        .integration-status.online { background: #004400; color: #00ff00; border: 1px solid #00ff00; }
        .integration-status.offline { background: #440000; color: #ff0000; border: 1px solid #ff0000; }

        .orders-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 11px;
        }
        .orders-table th {
            background: #1a1a1a;
            padding: 12px 10px;
            text-align: left;
            border-bottom: 2px solid #00ff00;
            color: #FFD700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .orders-table td {
            padding: 12px 10px;
            border-bottom: 1px solid #111;
            color: #ccc;
        }
        .orders-table tr:hover {
            background: #151515;
        }

        .btn {
            background: #00ff00;
            color: #000;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            transition: all 0.3s;
            border-radius: 3px;
            text-transform: uppercase;
            font-size: 11px;
            margin-right: 10px;
            margin-top: 10px;
        }
        .btn:hover { background: #00cc00; transform: translateY(-2px); }
        .btn-secondary { background: transparent; border: 1px solid #00ff00; color: #00ff00; }

        .empty-state {
            text-align: center;
            color: #666;
            padding: 60px 20px;
        }

        .refresh-indicator {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 255, 0, 0.1);
            border: 1px solid #00ff00;
            color: #00ff00;
            padding: 5px 15px;
            font-size: 10px;
            border-radius: 20px;
        }

        .footer {
            margin-top: 50px;
            text-align: center;
            color: #333;
            font-size: 10px;
            letter-spacing: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>⚔️ TUATH COIR ADMIN ⚔️</h1>
            <p style="color:#666; font-size:10px; letter-spacing:2px;">KINGDOM COMMAND CENTER</p>
        </div>
        <div class="timestamp">
            SYSTEM STATUS: ONLINE<br>
            LOCAL TIME: ${new Date().toLocaleString()}
        </div>
    </div>

    ${stats.pending_orders > 0 ? `
        <div class="alert">
            ⚠️ ATTENTION: There are <strong>${stats.pending_orders}</strong> pending orders requiring tribute verification.
        </div>
    ` : ''}

    <div class="grid">
        <!-- DAILY SCROLL -->
        <div class="panel">
            <h3>📜 DAILY SCROLL (TODAY)</h3>
            <div class="stat">
                <span class="stat-label">Orders:</span>
                <span class="stat-value">${stats.today_orders}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Revenue:</span>
                <span class="stat-value">$${stats.today_revenue}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Profit:</span>
                <span class="stat-value profit">$${stats.today_profit}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Avg Order:</span>
                <span class="stat-value">$${stats.today_orders > 0 ? (parseFloat(stats.today_revenue) / stats.today_orders).toFixed(2) : '0.00'}</span>
            </div>
        </div>

        <!-- THIS WEEK -->
        <div class="panel">
            <h3>📅 THIS WEEK (7 Days)</h3>
            <div class="stat">
                <span class="stat-label">Orders:</span>
                <span class="stat-value">${stats.week_orders}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Revenue:</span>
                <span class="stat-value">$${stats.week_revenue}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Profit:</span>
                <span class="stat-value profit">$${stats.week_profit}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Daily Avg:</span>
                <span class="stat-value">$${(parseFloat(stats.week_revenue) / 7).toFixed(2)}</span>
            </div>
        </div>

        <!-- ALL TIME STATS -->
        <div class="panel">
            <h3>📊 ALL TIME</h3>
            <div class="stat">
                <span class="stat-label">Total Orders:</span>
                <span class="stat-value">${stats.total_orders}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Total Revenue:</span>
                <span class="stat-value">$${stats.total_revenue}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Total Profit:</span>
                <span class="stat-value profit">$${stats.total_profit}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Avg Order Value:</span>
                <span class="stat-value">$${avgOrderValue}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Profit Margin:</span>
                <span class="stat-value profit">${profitMargin}%</span>
            </div>
        </div>

        <!-- INTEGRATIONS STATUS -->
        <div class="panel">
            <h3>🔌 INTEGRATIONS</h3>
            <div class="stat">
                <span class="stat-label">Stripe Payments:</span>
                <span class="integration-status ${env.STRIPE_SECRET_KEY ? 'online' : 'offline'}">
                    ${env.STRIPE_SECRET_KEY ? 'ONLINE' : 'OFFLINE'}
                </span>
            </div>
            <div class="stat">
                <span class="stat-label">Printful POD:</span>
                <span class="integration-status ${env.PRINTFUL_API_KEY ? 'online' : 'offline'}">
                    ${env.PRINTFUL_API_KEY ? 'ONLINE' : 'OFFLINE'}
                </span>
            </div>
            <div class="stat">
                <span class="stat-label">EPROLO:</span>
                <span class="integration-status ${env.EPROLO_API_KEY ? 'online' : 'offline'}">
                    ${env.EPROLO_API_KEY ? 'ONLINE' : 'OFFLINE'}
                </span>
            </div>
            <div class="stat">
                <span class="stat-label">Zendrop:</span>
                <span class="integration-status ${env.ZENDROP_API_KEY ? 'online' : 'offline'}">
                    ${env.ZENDROP_API_KEY ? 'ONLINE' : 'OFFLINE'}
                </span>
            </div>
            <div class="stat">
                <span class="stat-label">Database:</span>
                <span class="integration-status online">CONNECTED</span>
            </div>
        </div>
    </div>

    <!-- RECENT ORDERS TABLE -->
    <div class="panel">
        <h3>📦 RECENT ORDERS (Last 10)</h3>
        ${stats.recent_orders.length === 0 ? `
            <div class="empty-state">
                <div style="font-size: 48px; margin-bottom: 10px;">📭</div>
                <p>No orders yet</p>
                <p style="font-size: 10px; margin-top: 10px;">
                    Orders will appear here once customers start purchasing
                </p>
            </div>
        ` : `
            <div style="overflow-x: auto;">
                <table class="orders-table">
                    <thead>
                        <tr>
                            <th>ORDER #</th>
                            <th>CUSTOMER</th>
                            <th>EMAIL</th>
                            <th>TOTAL</th>
                            <th>PROFIT</th>
                            <th>PAYMENT</th>
                            <th>FULFILLMENT</th>
                            <th>DATE</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.recent_orders.map(order => `
                            <tr>
                                <td><strong>${order.order_number}</strong></td>
                                <td>${order.customer_name || '<em>N/A</em>'}</td>
                                <td>${order.customer_email}</td>
                                <td>$${order.total_amount?.toFixed(2) || '0.00'}</td>
                                <td style="color:#FFD700;"><strong>$${order.profit_amount?.toFixed(2) || '0.00'}</strong></td>
                                <td>
                                    <span class="status-badge status-${order.payment_status}">
                                        ${order.payment_status?.toUpperCase() || 'UNKNOWN'}
                                    </span>
                                </td>
                                <td>
                                    <span class="status-badge status-${order.fulfillment_status}">
                                        ${order.fulfillment_status?.toUpperCase() || 'UNKNOWN'}
                                    </span>
                                </td>
                                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `}
    </div>

    <!-- QUICK ACTIONS -->
    <div class="panel" style="margin-top: 20px;">
        <h3>⚡ QUICK ACTIONS</h3>
        <button class="btn" onclick="window.location.reload()">
            ↻ REFRESH DATA
        </button>
        <button class="btn btn-secondary" onclick="window.open('/api/products', '_blank')">
            📦 VIEW PRODUCTS
        </button>
        <button class="btn btn-secondary" onclick="window.open('https://dashboard.stripe.com', '_blank')">
            💳 OPEN STRIPE
        </button>
        <button class="btn btn-secondary" onclick="window.open('/', '_blank')">
            🏠 VIEW STOREFRONT
        </button>
    </div>

    <!-- AUTO-REFRESH INDICATOR -->
    <div class="refresh-indicator" id="refresh-timer">
        Auto-refresh in <span id="countdown">30</span>s
    </div>

    <script>
        // Auto-refresh countdown
        let seconds = 30;
        const countdownEl = document.getElementById('countdown');

        const interval = setInterval(() => {
            seconds--;
            countdownEl.textContent = seconds;

            if (seconds <= 0) {
                location.reload();
            }
        }, 1000);

        // Update page title with order count
        const orderCount = ${stats.today_orders};
        if (orderCount > 0) {
            document.title = '(' + orderCount + ') Tuath Coir Admin';
        }

        // Highlight new orders (if any)
        const rows = document.querySelectorAll('.orders-table tbody tr');
        if (rows.length > 0) {
            rows[0].style.background = 'rgba(0, 255, 0, 0.05)';
        }
    </script>

    <div class="footer">
        ANCIENT ROOTS • UNIFIED TRIBE • SECURE COMMAND
    </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS & HEALTH
// ═══════════════════════════════════════════════════════════════

async function verifyStripeSignature(body, signature, secret) {
  if (!signature || !secret) return false;

  try {
    const parts = signature.split(',').reduce((acc, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {});

    const timestamp = parts['t'];
    const v1 = parts['v1'];

    if (!timestamp || !v1) return false;

    const signedPayload = `${timestamp}.${body}`;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );

    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex === v1;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

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

function getInitiationPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>THE INITIATION | Tuath Coir Territories</title>
    <style>
        body { background: #000; color: #fff; font-family: sans-serif; padding: 20px; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .box { max-width: 500px; width: 100%; border: 1px solid #333; padding: 40px; background: #050505; }
        h2 { letter-spacing: 5px; text-transform: uppercase; border-bottom: 1px solid #222; padding-bottom: 20px; margin-bottom: 30px; }
        label { display: block; margin-bottom: 10px; font-size: 12px; color: #888; text-transform: uppercase; }
        input, select { width: 100%; padding: 12px; background: #111; border: 1px solid #333; color: #fff; margin-bottom: 20px; }
        .oath-box { background: #0a0a0a; padding: 20px; margin-bottom: 20px; border-left: 3px solid #006400; }
        .oath-item { display: flex; gap: 10px; margin-bottom: 15px; align-items: flex-start; }
        .oath-item input { width: auto; margin: 0; margin-top: 3px; }
        .oath-text { font-size: 14px; line-height: 1.5; color: #ccc; }
        .btn { background: #fff; color: #000; padding: 15px; border: none; width: 100%; font-weight: bold; cursor: pointer; text-transform: uppercase; }
        .btn:disabled { background: #333; cursor: not-allowed; }
    </style>
</head>
<body>
    <div class="box">
        <h2>THE INITIATION</h2>
        <form id="initiationForm">
            <label>Your Name</label>
            <input type="text" id="name" required placeholder="Name or Alias">

            <label>Messenger ID (Email)</label>
            <input type="email" id="email" required placeholder="email@address.com">

            <label>Claim Your Territory</label>
            <select id="territory" required>
                <option value="">Select Territory...</option>
                <option value="Highlands">The Highlands (Northern Reach)</option>
                <option value="Urban Core">The Urban Core (Metropolis)</option>
                <option value="Coastlands">The Coastlands (Western Edge)</option>
                <option value="Midlands">The Midlands (Heartland)</option>
            </select>

            <div class="oath-box">
                <div class="oath-item">
                    <input type="checkbox" required>
                    <span class="oath-text">I pledge to be true to who I am, unapologetically.</span>
                </div>
                <div class="oath-item">
                    <input type="checkbox" required>
                    <span class="oath-text">I will remain territorial over what is mine and my people.</span>
                </div>
                <div class="oath-item">
                    <input type="checkbox" required>
                    <span class="oath-text">I will contribute to building a just community of our own.</span>
                </div>
            </div>

            <label>E-Signature (Type full name)</label>
            <input type="text" id="signature" required placeholder="Type name to seal the oath">

            <button type="submit" class="btn" id="submitBtn">Seal the Oath</button>
        </form>

        <script>
            document.getElementById('initiationForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = document.getElementById('submitBtn');
                btn.disabled = true;
                btn.innerText = 'SEALING...';

                const data = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    territory: document.getElementById('territory').value,
                    signature: document.getElementById('signature').value
                };

                try {
                    const response = await fetch('/api/initiation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();

                    if (result.success) {
                        alert(result.message);
                        window.location.href = '/';
                    } else {
                        alert(result.error);
                        btn.disabled = false;
                        btn.innerText = 'Seal the Oath';
                    }
                } catch (err) {
                    alert('Initiation failed. The tribe awaits.');
                    btn.disabled = false;
                    btn.innerText = 'Seal the Oath';
                }
            });
        </script>
    </div>
</body>
</html>`;
}

function getLandingPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TUATH COIR | Ancient Celtic Roots. Protect Your Own.</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
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
            max-width: 600px;
        }
        .logo {
            border: 3px solid #fff;
            width: 80px;
            height: 80px;
            line-height: 80px;
            font-size: 32px;
            margin: 0 auto 20px;
            display: inline-block;
        }
        h1 {
            letter-spacing: 15px;
            font-size: clamp(24px, 8vw, 42px);
            color: #fff;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .tagline {
            color: #888;
            letter-spacing: 5px;
            font-size: clamp(10px, 3vw, 14px);
            margin-bottom: 50px;
            font-weight: 300;
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
        }
        .btn:hover {
            background: #006400;
            color: #FFD700;
        }
        .footer {
            color: #333;
            font-size: 10px;
            margin-top: 40px;
            letter-spacing: 2px;
        }
        .api-info {
            margin-top: 60px;
            padding-top: 40px;
            border-top: 1px solid #222;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #00ff00;
            text-align: left;
        }
        .api-info h3 {
            color: #00ff00;
            margin-bottom: 15px;
            letter-spacing: 2px;
        }
        .endpoint {
            background: #0d0d0d;
            border: 1px solid #00ff00;
            padding: 10px;
            margin: 5px 0;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">TC</div>
        <h1>TUATH COIR</h1>
        <p style="font-size: 10px; color: #888; letter-spacing: 10px; margin-bottom: 5px;">TERRITORIES</p>
        <p class="tagline">ANCIENT CELTIC ROOTS. PROTECT YOUR OWN.</p>

        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <a href="/api/products" class="btn">SHOP STREETWEAR</a>
            <a href="/initiation" class="btn" style="background: transparent; border: 2px solid #fff; color: #fff;">TAKE THE OATH</a>
        </div>

        <p class="footer">
            SMALL KINGDOM. UNIFIED TRIBE.<br>
            URBAN APPAREL • ATHLETIC WEAR • HIP-HOP STYLE
        </p>

        <div class="api-info">
            <h3>⚡ API ENDPOINTS (PHASE 2)</h3>
            <div class="endpoint">GET /api/products → List all products</div>
            <div class="endpoint">GET /api/products/:id → Single product details</div>
            <div class="endpoint">GET /api/categories → Product categories</div>
            <div class="endpoint">GET /health → System status</div>
            <div class="endpoint">POST /api/orders → Create order</div>
            <div class="endpoint">GET /initiation → Take the Oath</div>
            <div class="endpoint">GET /admin → Dashboard (Megan & Joy)</div>

            <p style="margin-top: 20px; color: #666;">
                STATUS: Phase 2 - Fulfillment & Security ✅<br>
                DATABASE: D1 Connected ✅<br>
                PRODUCTS: 12 Loaded ✅
            </p>
        </div>
    </div>
</body>
</html>`;
}
