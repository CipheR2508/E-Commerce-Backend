# Phase 1 – Database Schema Validation Tests

## Purpose
These scripts validate the correctness of the database schema
before backend or frontend development begins.

## How to Run
From the `schema/tests` directory:

```bash
mysql -u root -p ecommerce_dev < phase1_auth_validation.sql
mysql -u root -p ecommerce_dev < phase1_category_validation.sql
mysql -u root -p ecommerce_dev < phase1_product_validation.sql
mysql -u root -p ecommerce_dev < phase1_cart_validation.sql
mysql -u root -p ecommerce_dev < phase1_address_validation.sql
mysql -u root -p ecommerce_dev < phase1_order_validation.sql
mysql -u root -p ecommerce_dev < phase1_payment_invoice_validation.sql   #<-- FINAL

## Phase 1 Test Suite
schema/tests/
├── phase1_auth_validation.sql
├── phase1_category_validation.sql
├── phase1_product_validation.sql
├── phase1_cart_validation.sql
├── phase1_address_validation.sql
├── phase1_order_validation.sql
├── phase1_payment_invoice_validation.sql   ← FINAL
└── README.md
