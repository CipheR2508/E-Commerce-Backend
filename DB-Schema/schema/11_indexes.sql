-- ADDITIONAL INDEXES FOR PERFORMANCE

-- Composite indexes for common query patterns
CREATE INDEX idx_orders_user_status ON orders (user_id, status);

CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);

CREATE INDEX idx_products_category_active ON products (category_id, is_active);

CREATE INDEX idx_cart_user_updated ON cart (user_id, updated_at DESC);