-- ================================
-- Phase 1: Authentication Validation
-- ================================

START TRANSACTION;

-- 1. Insert test user
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES ('User1@test.com', 'Hashed_password', 'user', 'one');

-- 2. Verify user exists
SELECT * FROM users WHERE email = 'User1@test.com';

-- 3. Insert email verification token
INSERT INTO email_verification_tokens (user_id, token, expires_at)
VALUES (LAST_INSERT_ID(), 'email_token_test', NOW() + INTERVAL 1 DAY);

-- 4. Insert password reset token
INSERT INTO password_reset_tokens (user_id, token, expires_at)
VALUES (LAST_INSERT_ID(), 'reset_token_test', NOW() + INTERVAL 1 HOUR);

-- 5. Cleanup
ROLLBACK;
