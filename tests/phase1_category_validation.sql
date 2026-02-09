-- =====================================================
-- Phase 1 Validation: Category Hierarchy
-- =====================================================
-- Purpose:
--  - Validate parent-child categories
--  - Validate slug uniqueness
--  - Validate ON DELETE SET NULL behavior
-- =====================================================

START TRANSACTION;

-- 1. Insert parent categories
INSERT INTO categories (name, slug, description)
VALUES
  ('Electronics', 'electronics', 'Electronic products'),
  ('Fashion', 'fashion', 'Clothing and apparel');

-- 2. Fetch parent IDs
SET @electronics_id := (
  SELECT category_id FROM categories WHERE slug = 'electronics'
);
SET @fashion_id := (
  SELECT category_id FROM categories WHERE slug = 'fashion'
);

-- 3. Insert sub-categories
INSERT INTO categories (name, slug, parent_category_id)
VALUES
  ('Mobiles', 'mobiles', @electronics_id),
  ('Laptops', 'laptops', @electronics_id),
  ('Men', 'men-fashion', @fashion_id),
  ('Women', 'women-fashion', @fashion_id);

-- 4. Validate hierarchy
SELECT
  parent.name AS parent_category,
  child.name AS sub_category
FROM categories parent
JOIN categories child
  ON child.parent_category_id = parent.category_id
ORDER BY parent.name;

-- 5. Test ON DELETE SET NULL
DELETE FROM categories WHERE category_id = @electronics_id;

-- 6. Verify children survived
SELECT name, parent_category_id
FROM categories
WHERE slug IN ('mobiles', 'laptops');

-- 7. Cleanup
ROLLBACK;
