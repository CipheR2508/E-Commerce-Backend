-- =====================================================
-- Phase 1 Validation: Payments & Invoices Module
-- =====================================================
-- Purpose:
--  - Validate payment creation & linkage to orders
--  - Validate payment status lifecycle
--  - Validate invoice generation (1:1 with order)
--  - Validate FK constraints and uniqueness
-- =====================================================

START TRANSACTION;

-- -----------------------------------------------------
-- 1. Create prerequisite user
-- -----------------------------------------------------
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES ('paymentuser@test.com', 'hashed_password', 'Payment', 'User');

SET @user_id := (
  SELECT user_id FROM users WHERE email = 'paymentuser@test.com'
);

-- -----------------------------------------------------
-- 2. Create address
-- -----------------------------------------------------
INSERT INTO addresses (
  user_id, address_type, full_name, phone,
  address_line1, city, state, postal_code, country, is_default
)
VALUES (
  @user_id, 'home', 'Payment User', '9999999999',
  '500 Payment Street', 'Chennai', 'Tamil Nadu', '600001', 'India', TRUE
);

SET @address_id := (
  SELECT address_id FROM addresses
  WHERE user_id = @user_id AND is_default = TRUE
);

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
  'Payment Test Phone',
  'payment-test-phone',
  'SKU-PAY-001',
  39999.00,
  15,
  @category_id
);

SET @product_id := (
  SELECT product_id FROM products WHERE sku = 'SKU-PAY-001'
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
  billing_address_id,
  payment_status
)
VALUES (
  @user_id,
  'ORD-PAY-001',
  'confirmed',
  39999.00,
  39999.00,
  @address_id,
  @address_id,
  'pending'
);

SET @order_id := (
  SELECT order_id FROM orders WHERE order_number = 'ORD-PAY-001'
);

-- -----------------------------------------------------
-- 5. Create payment
-- -----------------------------------------------------
INSERT INTO payments (
  order_id,
  payment_method,
  transaction_id,
  amount,
  status
)
VALUES (
  @order_id,
  'card',
  'TXN-TEST-123',
  39999.00,
  'completed'
);

-- Verify payment
SELECT * FROM payments WHERE order_id = @order_id;

-- -----------------------------------------------------
-- 6. Update order payment status
-- -----------------------------------------------------
UPDATE orders
SET payment_status = 'paid'
WHERE order_id = @order_id;

-- Verify order payment state
SELECT order_number, payment_status FROM orders WHERE order_id = @order_id;

-- -----------------------------------------------------
-- 7. Generate invoice
-- -----------------------------------------------------
INSERT INTO invoices (
  order_id,
  invoice_number,
  file_path,
  file_url
)
VALUES (
  @order_id,
  'INV-TEST-001',
  '/invoices/INV-TEST-001.pdf',
  'https://cdn.example.com/invoices/INV-TEST-001.pdf'
);

-- Verify invoice
SELECT * FROM voices WHERE order_id = @order_id;

-- -----------------------------------------------------
-- 8. Validate 1:1 invoice constraint
-- -----------------------------------------------------
-- This should FAIL if uncommented
-- INSERT INTO invoices (order_id, invoice_number)
-- VALUES (@order_id, 'INV-TEST-002');

-- -----------------------------------------------------
-- 9. Cleanup
-- -----------------------------------------------------
ROLLBACK;
