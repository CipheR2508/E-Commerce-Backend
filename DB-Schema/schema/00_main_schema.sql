-- This file imports all module files in the correct order.
-- Execute this file to create the complete database schema.

-- Note: In MySQL, you can execute files using:
-- SOURCE schema/01_authentication.sql;
-- SOURCE schema/02_products.sql;
-- etc.
--
-- Or use a script to execute all files in order.
--
-- For PostgreSQL, use: \i schema/01_authentication.sql;
--
-- For command line (MySQL):
-- mysql -u username -p database_name < schema/00_main_schema.sql
--
-- =====================================================

-- Module 1: Authentication
SOURCE schema / 01_authentication.sql;

-- Module 2: Products
SOURCE schema / 02_products.sql;

-- Module 3: Cart
SOURCE schema / 03_cart.sql;

-- Module 4: Addresses
SOURCE schema / 04_addresses.sql;

-- Module 5: Orders
SOURCE schema / 05_orders.sql;

-- Module 6: Payments
SOURCE schema / 06_payments.sql;

-- Module 7: Invoices
SOURCE schema / 07_invoices.sql;

-- Module 8: User Profile
SOURCE schema / 08_user_profile.sql;

-- Triggers
SOURCE schema / 09_triggers.sql;

-- Views
SOURCE schema / 10_views.sql;

-- Additional Indexes
SOURCE schema / 11_indexes.sql;