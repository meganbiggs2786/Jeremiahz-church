/**
 * ═══════════════════════════════════════════════════════════════
 * TUATH COIR - COMPLETE E-COMMERCE PLATFORM
 * Ancient Celtic Roots. Street Justice.
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
      // ══════════ LANDING PAGE ══════════
      if (path === '/' || path === '/home') {
        return new Response(getLandingPage(), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      // ══════════ PRODUCTS API ══════════
      if (path === '/api/products' && request.method === 'GET') {
        return await handleGetProducts(request, env, headers);
      }

      if (path.startsWith('/api/products/') && request.method === 'GET') {
        const id = parseInt(path.split('/')[3]);
        return await handleGetSingleProduct(id, env, headers);
      }

      if (path === '/api/categories') {
        return await handleGetCategories(env, headers);
      }

      if (path === '/api/search') {
        const searchTerm = url.searchParams.get('q');
        return await handleSearch(searchTerm, env, headers);
      }

      // ══════════ ORDERS ══════════
      if (path === '/api/orders' && request.method === 'POST') {
        return await handleCreateOrder(request, env, headers);
      }

      if (path.startsWith('/api/orders/') && request.method === 'GET') {
        const orderNumber = path.split('/')[3];
        return await handleTrackOrder(orderNumber, env, headers);
      }

      // ══════════ PAYMENTS ══════════
      if (path === '/api/payment/create-intent' && request.method === 'POST') {
        return await handleCreatePaymentIntent(request, env, headers);
      }

      // ══════════ WEBHOOKS ══════════
      if (path === '/api/webhooks/stripe' && request.method === 'POST') {
        return await handleStripeWebhook(request, env, headers);
      }

      if (path === '/api/webhooks/printful' && request.method === 'POST') {
        return await handlePrintfulWebhook(request, env, headers);
      }

      // ══════════ ADMIN ══════════
      if (path.startsWith('/admin')) {
        return await handleAdmin(request, env, headers, path);
      }

      // ══════════ HEALTH CHECK ══════════
      if (path === '/health') {
        return await handleHealth(env, headers);
      }

      // ══════════ 404 ══════════
      return new Response(JSON.stringify({
        success: false,
        error: 'Endpoint not found',
        available: ['/api/products', '/api/orders', '/admin', '/health']
      }), { status: 404, headers });

    } catch (error) {
      console.error('Server error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message
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
    images: p.images ? JSON.parse(p.images) : []
  }));

  return new Response(JSON.stringify({
    success: true,
    count: products.length,
    products
  }, null, 2), { headers });
}

async function handleGetSingleProduct(id, env, headers) {
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

  return new Response(JSON.stringify({
    success: true,
    product
  }, null, 2), { headers });
}

async function handleGetCategories(env, headers) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM categories ORDER BY name'
  ).all();

  return new Response(JSON.stringify({
    success: true,
    categories: results
  }, null, 2), { headers });
}

async function handleSearch(searchTerm, env, headers) {
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

  return new Response(JSON.stringify({
    success: true,
    query: searchTerm,
    count: results.length,
    products: results
  }, null, 2), { headers });
}

// ═══════════════════════════════════════════════════════════════
// ORDER HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleCreateOrder(request, env, headers) {
  const orderData = await request.json();

  if (!orderData.items || !orderData.customer_email || !orderData.shipping_address) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Missing required fields'
    }), { status: 400, headers });
  }

  let subtotal = 0;
  let totalCost = 0;
  const items = [];
  const supplierGroups = {};

  for (const item of orderData.items) {
    const product = await env.DB.prepare(
      'SELECT * FROM products WHERE id = ?'
    ).bind(item.product_id).first();

    if (!product) continue;

    const itemSubtotal = product.price * item.quantity;
    const itemCost = product.cost_price * item.quantity;

    subtotal += itemSubtotal;
    totalCost += itemCost;

    const orderItem = {
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      cost_price: product.cost_price,
      supplier: product.supplier,
      supplier_product_id: product.supplier_product_id
    };

    items.push(orderItem);

    if (!supplierGroups[product.supplier]) {
      supplierGroups[product.supplier] = [];
    }
    supplierGroups[product.supplier].push(orderItem);
  }

  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;
  const stripeFee = (total * 0.029) + 0.30;
  const profit = subtotal - totalCost - stripeFee;

  const orderNumber = 'TC' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

  const order = {
    order_number: orderNumber,
    customer_name: orderData.customer_name || '',
    customer_email: orderData.customer_email,
    customer_phone: orderData.customer_phone || '',
    shipping_address: orderData.shipping_address,
    items,
    supplier_groups: supplierGroups,
    subtotal: subtotal.toFixed(2),
    tax: tax.toFixed(2),
    shipping: shipping.toFixed(2),
    total: total.toFixed(2),
    profit: profit.toFixed(2),
    created_at: new Date().toISOString()
  };

  await env.DB.prepare(`
    INSERT INTO orders (
      order_number, customer_email, customer_name,
      shipping_address, order_data, total_amount, profit_amount,
      status, payment_status, fulfillment_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    orderNumber,
    order.customer_email,
    order.customer_name,
    JSON.stringify(order.shipping_address),
    JSON.stringify(order),
    parseFloat(order.total),
    parseFloat(order.profit),
    'pending_payment',
    'unpaid',
    'unfulfilled',
    order.created_at
  ).run();

  return new Response(JSON.stringify({
    success: true,
    order_number: orderNumber,
    total: order.total,
    profit: order.profit
  }), { status: 201, headers });
}

async function handleTrackOrder(orderNumber, env, headers) {
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
      total: order.total_amount,
      items: orderData.items,
      created_at: order.created_at
    }
  }, null, 2), { headers });
}

// ═══════════════════════════════════════════════════════════════
// PAYMENT HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleCreatePaymentIntent(request, env, headers) {
  const { order_number, amount } = await request.json();

  if (!env.STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Payment not configured'
    }), { status: 500, headers });
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
      'automatic_payment_methods[enabled]': 'true'
    })
  });

  const paymentIntent = await stripeResponse.json();

  return new Response(JSON.stringify({
    success: true,
    client_secret: paymentIntent.client_secret
  }), { headers });
}

async function handleStripeWebhook(request, env, headers) {
  try {
    const event = await request.json();

    if (event.type === 'payment_intent.succeeded') {
      const orderNumber = event.data.object.metadata.order_number;

      await env.DB.prepare(`
        UPDATE orders
        SET payment_status = 'paid', status = 'processing', updated_at = ?
        WHERE order_number = ?
      `).bind(new Date().toISOString(), orderNumber).run();

      const order = await env.DB.prepare(
        'SELECT * FROM orders WHERE order_number = ?'
      ).bind(orderNumber).first();

      if (order) {
        const orderData = JSON.parse(order.order_data);
        await fulfillOrder(orderData, env);
      }
    }

    return new Response(JSON.stringify({ received: true }), { headers });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
}

async function handlePrintfulWebhook(request, env, headers) {
  try {
    const event = await request.json();

    console.log('Printful webhook received:', event.type);

    switch (event.type) {
      case 'package_shipped':
        const shipment = event.data;
        const orderNumber = shipment.order?.external_id;

        if (!orderNumber) {
          console.warn('No external_id in Printful webhook');
          break;
        }

        console.log(`📦 Printful package shipped for order: ${orderNumber}`);

        // Update order with tracking info
        await env.DB.prepare(`
          UPDATE orders
          SET fulfillment_status = 'shipped',
              tracking_number = ?,
              tracking_url = ?,
              updated_at = ?
          WHERE order_number = ?
        `).bind(
          shipment.tracking_number || '',
          shipment.tracking_url || '',
          new Date().toISOString(),
          orderNumber
        ).run();

        // Get order details for email
        const order = await env.DB.prepare(
          'SELECT * FROM orders WHERE order_number = ?'
        ).bind(orderNumber).first();

        if (order) {
          const orderData = JSON.parse(order.order_data);

          // Send tracking email to customer
          await sendTrackingEmail(orderData, {
            tracking_number: shipment.tracking_number,
            tracking_url: shipment.tracking_url,
            carrier: shipment.carrier || 'USPS'
          }, env);
        }

        break;

      case 'order_failed':
        console.error('Printful order failed:', event.data);
        break;

      case 'order_canceled':
        console.log('Printful order canceled:', event.data);
        break;
    }

    return new Response(JSON.stringify({ received: true }), { headers });
  } catch (error) {
    console.error('Printful webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook failed' }), { status: 500, headers });
  }
}

// ═══════════════════════════════════════════════════════════════
// AUTO-FULFILLMENT
// ═══════════════════════════════════════════════════════════════

async function fulfillOrder(orderData, env) {
  console.log(`Starting fulfillment for order: ${orderData.order_number}`);

  const supplierGroups = orderData.supplier_groups || {};
  const results = {
    printful: null,
    eprolo: null,
    zendrop: null,
    faire: null
  };

  try {
    // Send to Printful (Apparel)
    if (supplierGroups.Printful && supplierGroups.Printful.length > 0) {
      if (env.PRINTFUL_API_KEY) {
        results.printful = await sendToPrintful(orderData, supplierGroups.Printful, env);
      } else {
        console.warn('Printful API key not configured');
      }
    }

    // Send to EPROLO (Hygiene Kits)
    if (supplierGroups.EPROLO && supplierGroups.EPROLO.length > 0) {
      if (env.EPROLO_API_KEY) {
        results.eprolo = await sendToEprolo(orderData, supplierGroups.EPROLO, env);
      } else {
        console.warn('EPROLO API key not configured');
      }
    }

    // Send to Zendrop (Grooming Products)
    if (supplierGroups.Zendrop && supplierGroups.Zendrop.length > 0) {
      if (env.ZENDROP_API_KEY) {
        results.zendrop = await sendToZendrop(orderData, supplierGroups.Zendrop, env);
      } else {
        console.warn('Zendrop API key not configured');
      }
    }

    // Send to Faire (Handmade Soaps)
    if (supplierGroups.Faire && supplierGroups.Faire.length > 0) {
      if (env.FAIRE_API_TOKEN) {
        results.faire = await sendToFaire(orderData, supplierGroups.Faire, env);
      } else {
        console.warn('Faire API token not configured');
      }
    }

    // Update order status
    await env.DB.prepare(`
      UPDATE orders
      SET fulfillment_status = 'processing',
          updated_at = ?
      WHERE order_number = ?
    `).bind(new Date().toISOString(), orderData.order_number).run();

    console.log(`Fulfillment completed for order: ${orderData.order_number}`, results);

    return results;
  } catch (error) {
    console.error('Fulfillment error:', error);
    throw error;
  }
}

async function sendToPrintful(orderData, items, env) {
  try {
    console.log(`Sending ${items.length} items to Printful for order ${orderData.order_number}`);

    const printfulOrder = {
      external_id: orderData.order_number,
      shipping: 'STANDARD',
      recipient: {
        name: orderData.customer_name || orderData.customer_email,
        address1: orderData.shipping_address.line1,
        address2: orderData.shipping_address.line2 || '',
        city: orderData.shipping_address.city,
        state_code: orderData.shipping_address.state,
        country_code: orderData.shipping_address.country || 'US',
        zip: orderData.shipping_address.postal_code,
        phone: orderData.customer_phone || '',
        email: orderData.customer_email
      },
      items: items.map(item => {
        const variantId = item.supplier_product_id.replace(/[^0-9]/g, '');
        return {
          sync_variant_id: parseInt(variantId) || null,
          quantity: item.quantity,
          retail_price: item.price.toString(),
          name: item.name
        };
      }),
      retail_costs: {
        currency: 'USD',
        subtotal: orderData.subtotal,
        discount: '0.00',
        shipping: orderData.shipping,
        tax: orderData.tax,
        total: orderData.total
      },
      packing_slip: {
        email: env.SUPPORT_EMAIL || 'support@tuathcoir.com',
        phone: '',
        message: 'Thank you for supporting Tuath Coir! We hope you love your Irish-inspired products. 🍀'
      }
    };

    const response = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(printfulOrder)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Printful API error:', result);
      throw new Error(`Printful: ${result.error?.message || 'Unknown error'}`);
    }

    console.log(`✅ Printful order created: ${result.result.id}`);

    await env.DB.prepare(`
      UPDATE orders
      SET printful_order_id = ?, updated_at = ?
      WHERE order_number = ?
    `).bind(result.result.id.toString(), new Date().toISOString(), orderData.order_number).run();

    return { success: true, order_id: result.result.id, supplier: 'Printful' };
  } catch (error) {
    console.error('Printful fulfillment error:', error);
    return { success: false, error: error.message, supplier: 'Printful' };
  }
}

async function sendToEprolo(orderData, items, env) {
  try {
    console.log(`Sending ${items.length} items to EPROLO for order ${orderData.order_number}`);

    const eproloOrder = {
      orderNum: orderData.order_number,
      consignee: orderData.customer_name || orderData.customer_email,
      address: orderData.shipping_address.line1,
      city: orderData.shipping_address.city,
      province: orderData.shipping_address.state,
      country: orderData.shipping_address.country || 'US',
      zipCode: orderData.shipping_address.postal_code,
      phone: orderData.customer_phone || '',
      email: orderData.customer_email,
      products: items.map(item => ({
        productId: item.supplier_product_id,
        quantity: item.quantity,
        variantId: item.variant || ''
      }))
    };

    const response = await fetch('https://api.eprolo.com/api/v1/order/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.EPROLO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eproloOrder)
    });

    const result = await response.json();

    if (result.code !== 200 && result.code !== 0) {
      console.error('EPROLO API error:', result);
      throw new Error(`EPROLO: ${result.message || 'Unknown error'}`);
    }

    console.log(`✅ EPROLO order created: ${result.data?.orderId || 'unknown'}`);

    if (result.data?.orderId) {
      await env.DB.prepare(`
        UPDATE orders
        SET eprolo_order_id = ?, updated_at = ?
        WHERE order_number = ?
      `).bind(result.data.orderId.toString(), new Date().toISOString(), orderData.order_number).run();
    }

    return { success: true, order_id: result.data?.orderId, supplier: 'EPROLO' };
  } catch (error) {
    console.error('EPROLO fulfillment error:', error);
    return { success: false, error: error.message, supplier: 'EPROLO' };
  }
}

async function sendToZendrop(orderData, items, env) {
  try {
    console.log(`Sending ${items.length} items to Zendrop for order ${orderData.order_number}`);

    const zendropOrder = {
      order_number: orderData.order_number,
      shipping_address: {
        first_name: orderData.customer_name?.split(' ')[0] || 'Customer',
        last_name: orderData.customer_name?.split(' ').slice(1).join(' ') || '',
        address1: orderData.shipping_address.line1,
        address2: orderData.shipping_address.line2 || '',
        city: orderData.shipping_address.city,
        province: orderData.shipping_address.state,
        country: orderData.shipping_address.country || 'US',
        zip: orderData.shipping_address.postal_code,
        phone: orderData.customer_phone || '',
        email: orderData.customer_email
      },
      line_items: items.map(item => ({
        product_id: item.supplier_product_id,
        quantity: item.quantity
      }))
    };

    const response = await fetch('https://api.zendrop.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.ZENDROP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(zendropOrder)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Zendrop API error:', result);
      throw new Error(`Zendrop: ${result.error || 'Unknown error'}`);
    }

    console.log(`✅ Zendrop order created`);

    return { success: true, order_id: result.order_id || 'unknown', supplier: 'Zendrop' };
  } catch (error) {
    console.error('Zendrop fulfillment error:', error);
    return { success: false, error: error.message, supplier: 'Zendrop' };
  }
}

async function sendToFaire(orderData, items, env) {
  try {
    console.log(`📦 Faire order logged: ${orderData.order_number} (${items.length} items)`);
    return {
      success: true,
      order_id: orderData.order_number,
      supplier: 'Faire',
      note: 'Manual processing required'
    };
  } catch (error) {
    console.error('Faire logging error:', error);
    return { success: false, error: error.message, supplier: 'Faire' };
  }
}

async function sendTrackingEmail(orderData, tracking, env) {
  try {
    console.log(`📧 Sending tracking email to: ${orderData.customer_email}`);

    if (env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Tuath Coir <orders@tuathcoir.com>',
          to: orderData.customer_email,
          subject: `Your Tuath Coir Order Has Shipped! 🍀`,
          html: `
            <h1>Your Order is On The Way!</h1>
            <p>Hi ${orderData.customer_name || 'there'},</p>
            <p>Great news! Your order <strong>${orderData.order_number}</strong> has shipped.</p>
            <p><strong>Tracking Number:</strong> ${tracking.tracking_number}</p>
            <p><a href="${tracking.tracking_url}">Track Your Package</a></p>
            <p>Thank you for supporting Tuath Coir!</p>
            <p>- Megan & Joy</p>
          `
        })
      });
    }

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// ADMIN LOGIC
// ═══════════════════════════════════════════════════════════════

async function handleAdmin(request, env, headers, path) {
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

  const stats = await getAdminStats(env);

  return new Response(getAdminDashboard(stats, env), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function getAdminStats(env) {
  try {
    const allTime = await env.DB.prepare(`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(profit_amount), 0) as total_profit
      FROM orders
      WHERE payment_status = 'paid'
    `).first();

    const today = await env.DB.prepare(`
      SELECT
        COUNT(*) as today_orders,
        COALESCE(SUM(total_amount), 0) as today_revenue,
        COALESCE(SUM(profit_amount), 0) as today_profit
      FROM orders
      WHERE DATE(created_at) = DATE('now')
      AND payment_status = 'paid'
    `).first();

    const week = await env.DB.prepare(`
      SELECT
        COUNT(*) as week_orders,
        COALESCE(SUM(total_amount), 0) as week_revenue,
        COALESCE(SUM(profit_amount), 0) as week_profit
      FROM orders
      WHERE DATE(created_at) >= DATE('now', '-7 days')
      AND payment_status = 'paid'
    `).first();

    const pending = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM orders WHERE payment_status = 'unpaid'
    `).first();

    const { results: recentOrders } = await env.DB.prepare(`
      SELECT order_number, customer_email, customer_name, total_amount, profit_amount, status, payment_status, fulfillment_status, created_at
      FROM orders ORDER BY created_at DESC LIMIT 10
    `).all();

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
      total_orders: 0, total_revenue: '0.00', total_profit: '0.00',
      today_orders: 0, today_revenue: '0.00', today_profit: '0.00',
      week_orders: 0, week_revenue: '0.00', week_profit: '0.00',
      pending_orders: 0, recent_orders: []
    };
  }
}

async function handleHealth(env, headers) {
  try {
    const dbCheck = await env.DB.prepare('SELECT COUNT(*) as count FROM products').first();
    return new Response(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: { connected: true, products: dbCheck.count },
      phase: 2,
      features: {
        payments: !!env.STRIPE_SECRET_KEY,
        printful: !!env.PRINTFUL_API_KEY,
        admin: !!env.ADMIN_PASSWORD_HASH
      }
    }, null, 2), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ status: 'ERROR', error: e.message }), { status: 500, headers });
  }
}

// ═══════════════════════════════════════════════════════════════
// HTML TEMPLATES
// ═══════════════════════════════════════════════════════════════

function getLandingPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TUATH COIR | Ancient Celtic Roots</title>
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
        .logo { border: 3px solid #fff; width: 80px; height: 80px; line-height: 80px; font-size: 32px; margin: 0 auto 20px; }
        h1 { letter-spacing: 12px; font-size: 24px; color: #FFD700; }
        .tagline { color: #006400; letter-spacing: 4px; margin: 20px 0 40px; }
        .btn {
            background: linear-gradient(135deg, #006400, #228B22);
            color: #FFD700;
            padding: 15px 40px;
            border: 2px solid #FFD700;
            font-weight: bold; cursor: pointer; letter-spacing: 3px;
            text-transform: uppercase; margin: 10px; display: inline-block; text-decoration: none;
        }
        .btn:hover { background: #FFD700; color: #006400; }
        .footer { margin-top: 50px; color: #333; font-size: 10px; }
    </style>
</head>
<body>
    <div>
        <div class="logo">⚔️</div>
        <h1>TUATH COIR</h1>
        <p class="tagline">ANCIENT CELTIC ROOTS • STREET JUSTICE</p>
        <a href="/api/products" class="btn">SHOP NOW</a>
        <a href="/admin" class="btn">ADMIN</a>
        <p class="footer">
            IRISH APPAREL • MEN'S GROOMING • HANDMADE QUALITY<br>
            Phase 2 Active • Payments Enabled • Auto-Fulfillment Ready
        </p>
    </div>
</body>
</html>`;
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
        body { background: #000; color: #00ff00; font-family: 'Courier New', monospace; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }
        .login-box { border: 2px solid #00ff00; padding: 40px; background: #0a0a0a; max-width: 400px; box-shadow: 0 0 20px rgba(0, 255, 0, 0.2); }
        h1 { color: #FFD700; letter-spacing: 3px; margin-bottom: 20px; font-size: 24px; }
        .error { color: #ff0000; margin: 20px 0; padding: 10px; border: 1px solid #ff0000; background: rgba(255, 0, 0, 0.1); }
        p { color: #666; margin: 20px 0; line-height: 1.6; }
        .logo { font-size: 48px; margin-bottom: 20px; }
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
        body { background: #0a0a0a; color: #00ff00; font-family: 'Courier New', monospace; padding: 20px; line-height: 1.6; }
        .header { border-bottom: 2px solid #00ff00; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
        h1 { color: #FFD700; letter-spacing: 4px; font-size: 24px; }
        .timestamp { color: #666; font-size: 12px; text-align: right; }
        .alert { background: rgba(255, 215, 0, 0.1); border: 1px solid #FFD700; color: #FFD700; padding: 15px; margin-bottom: 20px; border-radius: 3px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .panel { border: 1px solid #00ff00; padding: 20px; background: #0d0d0d; border-radius: 3px; box-shadow: 0 0 10px rgba(0, 255, 0, 0.1); }
        .panel h3 { color: #00ff00; margin-bottom: 15px; font-size: 14px; letter-spacing: 2px; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px; }
        .stat { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #1a1a1a; }
        .stat:last-child { border-bottom: none; }
        .stat-label { color: #666; }
        .stat-value { color: #00ff00; font-weight: bold; }
        .stat-value.profit { color: #FFD700; }
        .status-badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 10px; font-weight: bold; }
        .status-paid { background: #003300; color: #00ff00; border: 1px solid #00ff00; }
        .status-unpaid { background: #330000; color: #ff6666; border: 1px solid #ff0000; }
        .orders-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
        .orders-table th { background: #001a00; padding: 10px 8px; text-align: left; border-bottom: 2px solid #00ff00; }
        .orders-table td { padding: 10px 8px; border-bottom: 1px solid #222; }
        .integration-status { display: flex; align-items: center; gap: 8px; }
        .online { color: #00ff00; }
        .online::before { content: '●'; margin-right: 5px; }
        .offline { color: #666; }
        .offline::before { content: '○'; margin-right: 5px; }
        .btn { background: #00ff00; color: #000; border: none; padding: 10px 20px; cursor: pointer; font-weight: bold; margin-right: 10px; margin-top: 10px; font-family: 'Courier New', monospace; border-radius: 3px; }
        .refresh-indicator { position: fixed; bottom: 20px; right: 20px; background: rgba(0, 255, 0, 0.1); border: 1px solid #00ff00; padding: 10px 15px; border-radius: 3px; font-size: 11px; color: #00ff00; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>⚔️ TUATH COIR COMMAND CENTER ⚔️</h1>
            <div style="color: #666; font-size: 11px; margin-top: 5px;">Ancient Celtic Roots • Street Justice</div>
        </div>
        <div class="timestamp">
            ${new Date().toLocaleString()}<br><strong>Owners:</strong> Megan & Joy
        </div>
    </div>
    ${stats.pending_orders > 0 ? `<div class="alert">⚠️ ${stats.pending_orders} order${stats.pending_orders > 1 ? 's' : ''} pending payment</div>` : ''}
    <div class="grid">
        <div class="panel">
            <h3>💰 TODAY</h3>
            <div class="stat"><span class="stat-label">Orders:</span><span class="stat-value">${stats.today_orders}</span></div>
            <div class="stat"><span class="stat-label">Revenue:</span><span class="stat-value">$${stats.today_revenue}</span></div>
            <div class="stat"><span class="stat-label">Profit:</span><span class="stat-value profit">$${stats.today_profit}</span></div>
        </div>
        <div class="panel">
            <h3>📅 THIS WEEK</h3>
            <div class="stat"><span class="stat-label">Orders:</span><span class="stat-value">${stats.week_orders}</span></div>
            <div class="stat"><span class="stat-label">Revenue:</span><span class="stat-value">$${stats.week_revenue}</span></div>
            <div class="stat"><span class="stat-label">Profit:</span><span class="stat-value profit">$${stats.week_profit}</span></div>
        </div>
        <div class="panel">
            <h3>📊 ALL TIME</h3>
            <div class="stat"><span class="stat-label">Orders:</span><span class="stat-value">${stats.total_orders}</span></div>
            <div class="stat"><span class="stat-label">Revenue:</span><span class="stat-value">$${stats.total_revenue}</span></div>
            <div class="stat"><span class="stat-label">Profit:</span><span class="stat-value profit">$${stats.total_profit}</span></div>
        </div>
        <div class="panel">
            <h3>🔌 INTEGRATIONS</h3>
            <div class="stat"><span class="stat-label">Stripe:</span><span class="integration-status ${env.STRIPE_SECRET_KEY ? 'online' : 'offline'}">${env.STRIPE_SECRET_KEY ? 'ONLINE' : 'OFFLINE'}</span></div>
            <div class="stat"><span class="stat-label">Printful:</span><span class="integration-status ${env.PRINTFUL_API_KEY ? 'online' : 'offline'}">${env.PRINTFUL_API_KEY ? 'ONLINE' : 'OFFLINE'}</span></div>
        </div>
    </div>
    <div class="panel">
        <h3>📦 RECENT ORDERS</h3>
        <table class="orders-table">
            <thead><tr><th>ORDER #</th><th>CUSTOMER</th><th>TOTAL</th><th>PROFIT</th><th>STATUS</th><th>DATE</th></tr></thead>
            <tbody>
                ${stats.recent_orders.map(order => `
                    <tr>
                        <td><strong>${order.order_number}</strong></td>
                        <td>${order.customer_email}</td>
                        <td>$${order.total_amount?.toFixed(2)}</td>
                        <td style="color:#FFD700;">$${order.profit_amount?.toFixed(2)}</td>
                        <td><span class="status-badge status-${order.payment_status}">${order.payment_status?.toUpperCase()}</span></td>
                        <td>${new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    <div class="refresh-indicator">Auto-refresh in <span id="countdown">30</span>s</div>
    <script>
        let seconds = 30;
        setInterval(() => {
            seconds--;
            document.getElementById('countdown').textContent = seconds;
            if (seconds <= 0) location.reload();
        }, 1000);
    </script>
</body>
</html>`;
}
