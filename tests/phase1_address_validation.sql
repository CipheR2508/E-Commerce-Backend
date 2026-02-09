-- =====================================================
-- Phase 1 Validation: Address Management Module
-- =====================================================
-- Purpose:
--  - Validate address ownership
--  - Validate multiple addresses per user
--  - Validate single default address logic (MySQL-safe)
-- =====================================================

START TRANSACTION;

-- -----------------------------------------------------
-- 1. Create prerequisite user
-- -----------------------------------------------------
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES ('addressuser@test.com', 'hashed_password', 'Address', 'User');

SET @user_id := (
  SELECT user_id FROM users WHERE email = 'addressuser@test.com'
);

-- -----------------------------------------------------
-- 2. Insert first address (default)
-- -----------------------------------------------------
INSERT INTO addresses (
  user_id, address_type, full_name, phone,
  address_line1, city, state, postal_code, country, is_default
)
VALUES (
  @user_id, 'home', 'Address User', '9999999999',
  '123 Main Street', 'Mumbai', 'Maharashtra', '400001', 'India', TRUE
);

-- -----------------------------------------------------
-- 3. Insert second address (non-default)
-- -----------------------------------------------------
INSERT INTO addresses (
  user_id, address_type, full_name, phone,
  address_line1, city, state, postal_code, country, is_default
)
VALUES (
  @user_id, 'work', 'Address User', '8888888888',
  '456 Office Road', 'Pune', 'Maharashtra', '411001', 'India', FALSE
);

-- -----------------------------------------------------
-- 4. Application-style default switch (MySQL-safe)
-- -----------------------------------------------------
UPDATE addresses
SET is_default = FALSE
WHERE user_id = @user_id;

UPDATE addresses
SET is_default = TRUE
WHERE user_id = @user_id
  AND address_type = 'work';

-- -----------------------------------------------------
-- 5. Validate single default
-- -----------------------------------------------------
SELECT address_id, address_type, is_default
FROM addresses
WHERE user_id = @user_id;

SELECT COUNT(*) AS default_address_count
FROM addresses
WHERE user_id = @user_id
  AND is_default = TRUE;

-- Expected: default_address_count = 1

-- -----------------------------------------------------
-- 6. Cleanup
-- -----------------------------------------------------
ROLLBACK;
