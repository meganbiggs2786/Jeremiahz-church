-- ═══════════════════════════════════════════════════════════════
-- TUATH COIR - SEED DATA
-- Sample product catalog with exact pricing
-- ═══════════════════════════════════════════════════════════════

INSERT INTO products (sku, name, description, category, price, cost_price, supplier, supplier_product_id, images) VALUES

-- IRISH APPAREL
('TC-TSHIRT-001', 'Celtic Clover T-Shirt', 'Premium Bella+Canvas tee with Celtic clover design. Soft cotton, unisex fit. Available in Forest Green, Black, White.', 'Irish Apparel', 29.99, 12.95, 'Printful', 'PRINTFUL_ID_REPLACE', '["https://via.placeholder.com/500/006400/FFFFFF?text=Celtic+Clover+Tee"]'),

('TC-HOODIE-001', 'Celtic Knot Hoodie', 'Cozy hoodie with intricate Celtic knot. Perfect for Irish pride. Soft fleece, kangaroo pocket.', 'Irish Apparel', 49.99, 28.50, 'Printful', 'PRINTFUL_ID_REPLACE', '["https://via.placeholder.com/500/006400/FFFFFF?text=Celtic+Hoodie"]'),

('TC-HAT-001', 'Shamrock Embroidered Hat', 'Classic snapback with shamrock and TC logo. Adjustable, one size fits most.', 'Irish Apparel', 24.99, 11.50, 'Printful', 'PRINTFUL_ID_REPLACE', '["https://via.placeholder.com/500/006400/FFFFFF?text=Shamrock+Hat"]'),

-- MENS HYGIENE
('TC-BEARD-001', 'Premium Beard Grooming Kit', '5-piece professional kit: oil, balm, brush, comb, scissors. Perfect for Irish gentlemen.', 'Mens Hygiene', 39.99, 15.50, 'EPROLO', 'EPROLO_ID_REPLACE', '["https://via.placeholder.com/500/8B4513/FFFFFF?text=Beard+Kit"]'),

('TC-SKIN-001', 'Daily Skincare Set for Men', '4-step routine: cleanser, toner, moisturizer, eye cream. Natural ingredients.', 'Mens Hygiene', 34.99, 12.00, 'Zendrop', 'ZENDROP_ID_REPLACE', '["https://via.placeholder.com/500/4682B4/FFFFFF?text=Skincare+Set"]'),

('TC-TRAVEL-001', 'Travel Hygiene Kit', 'TSA-approved essentials in premium leather bag. Perfect for business trips.', 'Mens Hygiene', 29.99, 10.75, 'EPROLO', 'EPROLO_ID_REPLACE', '["https://via.placeholder.com/500/696969/FFFFFF?text=Travel+Kit"]'),

-- HANDMADE BATH
('TC-SOAP-001', 'Irish Moss Soap', 'Handcrafted with real Irish moss. Ocean-fresh scent, deeply moisturizing. 4oz bar.', 'Handmade Bath', 9.99, 3.50, 'Faire', 'FAIRE_ID_REPLACE', '["https://via.placeholder.com/500/87CEEB/FFFFFF?text=Irish+Moss+Soap"]'),

('TC-SOAP-002', 'Celtic Sea Salt Scrub Bar', 'Exfoliating soap with Celtic sea salt. Masculine cedar scent. Perfect for rough skin.', 'Handmade Bath', 11.99, 4.00, 'Faire', 'FAIRE_ID_REPLACE', '["https://via.placeholder.com/500/87CEEB/FFFFFF?text=Sea+Salt+Soap"]'),

('TC-SOAP-003', 'Guinness Beer Soap', 'Made with REAL Guinness! Rich lather, moisturizing. Perfect Irish gift.', 'Handmade Bath', 13.99, 5.00, 'Faire', 'FAIRE_ID_REPLACE', '["https://via.placeholder.com/500/000000/FFFFFF?text=Guinness+Soap"]'),

('TC-BATH-001', 'Celtic Sea Bath Soak', '16oz jar of Celtic sea minerals with eucalyptus and mint. 8-10 baths.', 'Handmade Bath', 19.99, 7.50, 'WholesaleBotanics', 'WB_ID_REPLACE', '["https://via.placeholder.com/500/4682B4/FFFFFF?text=Bath+Soak"]'),

-- BUNDLES
('TC-BUNDLE-001', 'The Irish Gentleman', 'Celtic T-Shirt + Beard Kit. Everything the modern Irishman needs. Save $5!', 'Bundles', 64.99, 28.45, 'Multiple', 'BUNDLE_001', '["https://via.placeholder.com/500/006400/FFD700?text=Gentleman+Bundle"]'),

('TC-BUNDLE-002', 'Complete Grooming Collection', 'Skincare + Shaving + Hair products. Total transformation. Save $15!', 'Bundles', 89.99, 49.55, 'Multiple', 'BUNDLE_002', '["https://via.placeholder.com/500/8B4513/FFFFFF?text=Grooming+Bundle"]');
