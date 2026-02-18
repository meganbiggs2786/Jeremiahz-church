CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  cost_price REAL NOT NULL,
  supplier TEXT NOT NULL,
  supplier_product_id TEXT,
  images TEXT,
  inventory_quantity INTEGER DEFAULT 999,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  shipping_address TEXT,
  order_data TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  fulfillment_status TEXT DEFAULT 'unfulfilled',
  total_amount REAL NOT NULL,
  profit_amount REAL,
  printful_order_id TEXT,
  eprolo_order_id TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT
);

INSERT INTO categories (name, slug, description) VALUES
('Irish Apparel', 'irish-apparel', 'Celtic-inspired clothing and accessories'),
('Mens Hygiene', 'mens-hygiene', 'Premium grooming and skincare products'),
('Handmade Bath', 'handmade-bath', 'Artisan soaps and natural bath products'),
('Bundles', 'bundles', 'Product combinations with special pricing');

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status);
