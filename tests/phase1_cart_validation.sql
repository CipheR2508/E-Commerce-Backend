-- =====================================================
-- Phase 1 Validation: Cart Module
-- =====================================================
-- Purpose:
--  - Validate cart insert logic
--  - Validate unique (user_id, product_id)
--  - Validate quantity updates
--  - Validate price snapshot behavior
--  - Validate cart summary view
-- =====================================================

START TRANSACTION;

-- -----------------------------------------------------
-- 1. Create prerequisite user
-- -----------------------------------------------------
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES ('cartuser@test.com', 'hashed_password', 'Cart', 'User');

SET @user_id := (
  SELECT user_id FROM users WHERE email = 'cartuser@test.com'
);

-- -----------------------------------------------------
-- 2. Create prerequisite category
-- -----------------------------------------------------
INSERT INTO categories (name, slug)
VALUES ('Electronics', 'electronics');

SET @category_id := (
  SELECT category_id FROM categories WHERE slug = 'electronics'
);

-- -----------------------------------------------------
-- 3. Create prerequisite product
-- -----------------------------------------------------
INSERT INTO products (
  name, slug, sku, price, stock_quantity, category_id
)
VALUES (
  'Cart Test Phone',
  'cart-test-phone',
  'SKU-CART-001',
  19999.00,
  50,
  @category_id
);

SET @product_id := (
  SELECT product_id FROM products WHERE sku = 'SKU-CART-001'
);

-- -----------------------------------------------------
-- 4. Add product to cart
-- -----------------------------------------------------
INSERT INTO cart (user_id, product_id, quantity, price_at_added)
VALUES (@user_id, @product_id, 1, 19999.00);

-- Verify cart insert
SELECT * FROM cart WHERE user_id = @user_id;

-- -----------------------------------------------------
-- 5. Update quantity (simulate add-to-cart again)
-- -----------------------------------------------------
UPDATE cart
SET quantity = quantity + 2
WHERE user_id = @user_id
  AND product_id = @product_id;

-- Verify quantity update
SELECT user_id, product_id, quantity, price_at_added
FROM cart
WHERE user_id = @user_id;

-- -----------------------------------------------------
-- 6. Validate unique constraint (manual check)
-- -----------------------------------------------------
-- This insert should FAIL if uncommented
-- INSERT INTO cart (user_id, product_id, quantity, price_at_added)
-- VALUES (@user_id, @product_id, 1, 19999.00);

-- -----------------------------------------------------
-- 7. Validate price snapshot immutability
-- -----------------------------------------------------
-- Change product price
UPDATE products
SET price = 24999.00
WHERE product_id = @product_id;

-- Cart price_at_added must remain unchanged
SELECT
  c.quantity,
  c.price_at_added,
  p.price AS current_product_price
FROM cart c
JOIN products p ON p.product_id = c.product_id
WHERE c.user_id = @user_id;

-- -----------------------------------------------------
-- 8. Validate cart summary view
-- -----------------------------------------------------
SELECT * FROM vw_user_cart_summary WHERE user_id = @user_id;

-- -----------------------------------------------------
-- 9. Cleanup
-- -----------------------------------------------------
ROLLBACK;
