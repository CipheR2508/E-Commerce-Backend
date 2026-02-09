-- =====================================================
-- Phase 1 Validation: Orders & Order History Module
-- =====================================================
-- Purpose:
--  - Validate order creation
--  - Validate order_items integrity
--  - Validate address snapshot usage
--  - Validate order_status_history trigger
-- =====================================================

START TRANSACTION;

-- -----------------------------------------------------
-- 1. Create prerequisite user
-- -----------------------------------------------------
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES ('orderuser@test.com', 'hashed_password', 'Order', 'User');

SET @user_id := (
  SELECT user_id FROM users WHERE email = 'orderuser@test.com'
);

-- -----------------------------------------------------
-- 2. Create addresses (shipping & billing)
-- -----------------------------------------------------
INSERT INTO addresses (
  user_id, address_type, full_name, phone,
  address_line1, city, state, postal_code, country, is_default
)
VALUES (
  @user_id, 'home', 'Order User', '9999999999',
  '101 Order Street', 'Delhi', 'Delhi', '110001', 'India', TRUE
);

SET @shipping_address_id := (
  SELECT address_id FROM addresses
  WHERE user_id = @user_id AND is_default = TRUE
);

-- Reuse same address as billing for test
SET @billing_address_id := @shipping_address_id;

-- -----------------------------------------------------
-- 3. Create category & product
-- -----------------------------------------------------
INSERT INTO categories (name, slug)
VALUES ('Electronics', 'electronics');

SET @category_id := (
  SELECT category_id FROM categories WHERE slug = 'electronics'
);

INSERT INTO products (
  name, slug, sku, price, stock_quantity, category_id
)
VALUES (
  'Order Test Phone',
  'order-test-phone',
  'SKU-ORDER-001',
  29999.00,
  20,
  @category_id
);

SET @product_id := (
  SELECT product_id FROM products WHERE sku = 'SKU-ORDER-001'
);

-- -----------------------------------------------------
-- 4. Create order
-- -----------------------------------------------------
INSERT INTO orders (
  user_id,
  order_number,
  status,
  subtotal,
  total_amount,
  shipping_address_id,
  billing_address_id
)
VALUES (
  @user_id,
  'ORD-TEST-001',
  'pending',
  29999.00,
  29999.00,
  @shipping_address_id,
  @billing_address_id
);

SET @order_id := (
  SELECT order_id FROM orders WHERE order_number = 'ORD-TEST-001'
);

-- -----------------------------------------------------
-- 5. Insert order items
-- -----------------------------------------------------
INSERT INTO order_items (
  order_id,
  product_id,
  product_name,
  product_sku,
  quantity,
  unit_price,
  total_price
)
VALUES (
  @order_id,
  @product_id,
  'Order Test Phone',
  'SKU-ORDER-001',
  1,
  29999.00,
  29999.00
);

-- Verify order and items
SELECT * FROM orders WHERE order_id = @order_id;
SELECT * FROM order_items WHERE order_id = @order_id;

-- -----------------------------------------------------
-- 6. Update order status (trigger validation)
-- -----------------------------------------------------
UPDATE orders
SET status = 'confirmed'
WHERE order_id = @order_id;

UPDATE orders
SET status = 'shipped'
WHERE order_id = @order_id;

-- -----------------------------------------------------
-- 7. Validate order status history trigger
-- -----------------------------------------------------
SELECT status, notes, created_at
FROM order_status_history
WHERE order_id = @order_id
ORDER BY created_at;

-- -----------------------------------------------------
-- 8. Validate address snapshot integrity
-- -----------------------------------------------------
-- Update address AFTER order creation
UPDATE addresses
SET city = 'Bengalore'
WHERE address_id = @shipping_address_id;

-- Order should still reference same address_id
SELECT
  o.order_number,
  a.city AS current_address_city
FROM orders o
JOIN addresses a ON o.shipping_address_id = a.address_id
WHERE o.order_id = @order_id;

-- -----------------------------------------------------
-- 9. Cleanup
-- -----------------------------------------------------
ROLLBACK;
