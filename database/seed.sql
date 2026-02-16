-- ═══════════════════════════════════════════════════════════════
-- TUATH COIR - SEED DATA
-- Urban Wear catalog with exact pricing
-- ═══════════════════════════════════════════════════════════════

INSERT INTO products (sku, name, description, category, price, cost_price, supplier, supplier_product_id, images) VALUES

-- URBAN APPAREL (Streetwear focus)
('TC-TSHIRT-001', 'Celtic Clover Street Tee', 'Heavyweight oversized tee with signature Celtic clover. Urban fit, premium 100% cotton. Available in Forest Green, Midnight Black, and Stone White.', 'Urban Apparel', 29.99, 12.95, 'Printful', 'PRINTFUL_ID_REPLACE', '["https://via.placeholder.com/500/006400/FFFFFF?text=Celtic+Street+Tee"]'),

('TC-HOODIE-001', 'Celtic Knot Oversized Hoodie', 'Premium heavyweight hoodie with intricate Celtic knot embroidery. Hip-hop style oversized fit, soft fleece lining, kangaroo pocket.', 'Urban Apparel', 54.99, 28.50, 'Printful', 'PRINTFUL_ID_REPLACE', '["https://via.placeholder.com/500/006400/FFFFFF?text=Celtic+Urban+Hoodie"]'),

('TC-HAT-001', 'Shamrock Snapback Hat', 'Urban snapback with premium embroidered shamrock and TC monogram. Structured 6-panel design, classic street style.', 'Urban Apparel', 24.99, 11.50, 'Printful', 'PRINTFUL_ID_REPLACE', '["https://via.placeholder.com/500/006400/FFFFFF?text=Shamrock+Snapback"]'),

-- ATHLETIC WEAR (Performance Street Style)
('TC-JOGGER-001', 'Tribe Defense Joggers', 'Performance tech fleece joggers with Celtic trim. Tapered urban fit, zip pockets, moisture-wicking fabric for the street or the gym.', 'Athletic Wear', 44.99, 22.00, 'EPROLO', 'EPROLO_ID_REPLACE', '["https://via.placeholder.com/500/222222/FFFFFF?text=Tribe+Defense+Joggers"]'),

('TC-TANK-001', 'Celtic Performance Tank', 'Lightweight mesh tank with bold Celtic knot design. High-performance fabric with an urban athletic cut.', 'Athletic Wear', 26.99, 11.00, 'Printful', 'PRINTFUL_ID_REPLACE', '["https://via.placeholder.com/500/006400/FFFFFF?text=Celtic+Tank"]'),

('TC-JACKET-001', 'Urban Warrior Windbreaker', 'Water-resistant lightweight windbreaker with reflective Celtic accents. Perfect for night street style.', 'Athletic Wear', 59.99, 32.00, 'EPROLO', 'EPROLO_ID_REPLACE', '["https://via.placeholder.com/500/111111/FFFFFF?text=Warrior+Windbreaker"]'),

-- ACCESSORIES
('TC-BAG-001', 'Celtic Roots Crossbody Bag', 'Durable urban crossbody bag with TC branding. Multiple compartments for everyday essentials.', 'Accessories', 34.99, 14.50, 'EPROLO', 'EPROLO_ID_REPLACE', '["https://via.placeholder.com/500/000000/FFFFFF?text=Celtic+Crossbody"]'),

('TC-BEAR-OIL-001', 'Street Fresh Beard Oil', 'Premium beard oil for the urban gentleman. Woodsy scent with a hint of citrus. Keep your street style sharp.', 'Accessories', 19.99, 7.50, 'WholesaleBotanics', 'WB_ID_REPLACE', '["https://via.placeholder.com/500/8B4513/FFFFFF?text=Street+Beard+Oil"]'),

-- BUNDLES
('TC-BUNDLE-001', 'The Street King Bundle', 'Oversized Hoodie + Snapback Hat + Crossbody Bag. The ultimate urban outfit. Save $15!', 'Bundles', 99.99, 54.45, 'Multiple', 'BUNDLE_001', '["https://via.placeholder.com/500/006400/FFD700?text=Street+King+Bundle"]'),

('TC-BUNDLE-002', 'Urban Athlete Set', 'Performance Tank + Tech Joggers. High-performance style for the street. Save $10!', 'Bundles', 61.99, 33.00, 'Multiple', 'BUNDLE_002', '["https://via.placeholder.com/500/222222/FFFFFF?text=Urban+Athlete+Set"]');

-- SEED NOTES
INSERT INTO notes (author_id, author_name, category, content) VALUES
('megan', 'Megan', 'general', 'Welcome to the Tuath Coir owner app! This is where we will manage everything.'),
('lucky_lady', 'One Lucky Lady', 'design', 'I love the new Celtic Clover Street Tee design. Let''s push this on social media.'),
('megan', 'Megan', 'marketing', 'I''ve started a new ad campaign for the Highlands territory.');

-- SEED ACTIVITY
INSERT INTO activity_logs (action, description) VALUES
('system_init', 'Tuath Coir backend initialized with Phase 2 fulfillment systems.'),
('new_product', 'Added 10 new products to the Urban Wear collection.'),
('new_note', 'Megan left a new note in General.');
