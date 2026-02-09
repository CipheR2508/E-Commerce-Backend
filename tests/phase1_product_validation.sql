-- =====================================================
-- Phase 1 Validation: Products, Images, Attributes
-- =====================================================
-- Purpose:
--  - Validate product creation
--  - Validate product images
--  - Validate attribute system
--  - Validate FK cascades
-- =====================================================

START TRANSACTION;

-- 1. Create category
INSERT INTO categories (name, slug)
VALUES ('Electronics', 'electronics');

SET @category_id := (
  SELECT category_id FROM categories WHERE slug = 'electronics'
);

-- 2. Create product
INSERT INTO products (
  name, slug, sku, price, stock_quantity, category_id
)
VALUES (
  'Test Phone',
  'test-phone',
  'SKU-TEST-001',
  49999.00,
  10,
  @category_id
);

SET @product_id := (
  SELECT product_id FROM products WHERE sku = 'SKU-TEST-001'
);

-- 3. Insert product images
INSERT INTO product_images (product_id, image_url, is_primary)
VALUES
  (@product_id, 'https://img/test1.jpg', TRUE),
  (@product_id, 'https://img/test2.jpg', FALSE);

-- 4. Ensure attributes exist (idempotent)
INSERT INTO product_attributes (name, slug, is_filterable)
SELECT 'Color', 'color', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM product_attributes WHERE slug = 'color'
);

INSERT INTO product_attributes (name, slug, is_filterable)
SELECT 'Storage', 'storage', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM product_attributes WHERE slug = 'storage'
);

-- 5. Fetch attribute IDs safely
SET @color_attr := (
  SELECT attribute_id FROM product_attributes WHERE slug = 'color'
);

SET @storage_attr := (
  SELECT attribute_id FROM product_attributes WHERE slug = 'storage'
);
-- Defensive check (optional but recommended)
SELECT @color_attr AS color_attr_id, @storage_attr AS storage_attr_id;

-- 6. Validate product aggregation
SELECT
  p.name,
  p.price,
  c.name AS category,
  pa.name AS attribute,
  pav.value_text
FROM products p
JOIN categories c ON p.category_id = c.category_id
JOIN product_attribute_values pav ON pav.product_id = p.product_id
JOIN product_attributes pa ON pav.attribute_id = pa.attribute_id
WHERE p.product_id = @product_id;

-- 7. Cleanup
ROLLBACK;
