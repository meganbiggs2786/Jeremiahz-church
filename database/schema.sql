-- ═══════════════════════════════════════════════════════════════
-- TUATH COIR - DATABASE SCHEMA
-- Cloudflare D1 (SQLite)
-- ═══════════════════════════════════════════════════════════════

-- Products table
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

-- Orders table
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
  tracking_number TEXT,
  tracking_url TEXT,
  stripe_payment_id TEXT,
  stripe_customer_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT
);

-- Insert categories
INSERT INTO categories (name, slug, description) VALUES
('Urban Apparel', 'urban-apparel', 'Premium hoodies and tees'),
('Athletic Wear', 'athletic-wear', 'Performance street style'),
('Accessories', 'accessories', 'Urban essentials'),
('Bundles', 'bundles', 'Streetwear collections');

-- Members table (Initiates)
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  territory TEXT NOT NULL,
  oath_version TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Notes table for owner collaboration
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id TEXT NOT NULL,
  author_name TEXT,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs for tracking business events
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  description TEXT,
  metadata TEXT, -- JSON extra data
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_logs(action);
