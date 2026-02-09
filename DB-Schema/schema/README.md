# Database Schema Documentation

## Overview
This is a modular database schema for a User Panel e-commerce system. The schema is split into separate files for better organization, maintainability, and team collaboration.

## File Structure

```
schema/
├── 00_main_schema.sql      # Main file that imports all modules
├── 01_authentication.sql   # Users, password reset, email verification
├── 02_products.sql         # Categories, products, images, attributes
├── 03_cart.sql            # Shopping cart
├── 04_addresses.sql       # User addresses
├── 05_orders.sql          # Orders, order items, order history
├── 06_payments.sql        # Payment transactions
├── 07_invoices.sql        # Invoice management
├── 08_user_profile.sql    # User preferences
├── 09_triggers.sql        # Database triggers
├── 10_views.sql           # Database views
├── 11_indexes.sql         # Additional performance indexes
└── README.md              # This file
```

## Installation

### Option 1: Execute Main File (MySQL)
```bash
mysql -u username -p database_name < schema/00_main_schema.sql
```

### Option 2: Execute Files Individually
Execute each file in numerical order:
```bash
mysql -u username -p database_name < schema/01_authentication.sql
mysql -u username -p database_name < schema/02_products.sql
# ... and so on
```

### Option 3: Using MySQL Client
```sql
SOURCE schema/01_authentication.sql;
SOURCE schema/02_products.sql;
-- ... continue with remaining files
```

## Module Descriptions

### 01_authentication.sql
- **users**: Core user accounts with email verification
- **password_reset_tokens**: Forgot password functionality
- **email_verification_tokens**: Email verification system

### 02_products.sql
- **categories**: Hierarchical product categories
- **products**: Product catalog with full-text search
- **product_images**: Multiple images per product
- **product_attributes**: Flexible attribute system
- **product_attribute_values**: Product attribute values

### 03_cart.sql
- **cart**: Shopping cart with price tracking

### 04_addresses.sql
- **addresses**: User shipping/billing addresses

### 05_orders.sql
- **orders**: Order management
- **order_items**: Order line items
- **order_status_history**: Complete order audit trail

### 06_payments.sql
- **payments**: Payment transaction records

### 07_invoices.sql
- **invoices**: Invoice generation and storage

### 08_user_profile.sql
- **user_preferences**: Extensible user preferences

### 09_triggers.sql
- Automatic order status history tracking
- Single default address enforcement

### 10_views.sql
- Pre-built views for common queries

### 11_indexes.sql
- Additional performance indexes

## Modifying the Schema

### Adding a New Field to Existing Table
```sql
ALTER TABLE table_name ADD COLUMN new_field TYPE;
```

### Adding a New Table
Create a new file following the naming convention: `XX_module_name.sql`

### Modifying Relationships
```sql
ALTER TABLE table_name 
ADD FOREIGN KEY (column) REFERENCES other_table(column);
```

### Adding New Enum Values
```sql
ALTER TABLE table_name 
MODIFY COLUMN enum_field ENUM('old1', 'old2', 'new1');
```

### Adding Indexes
```sql
CREATE INDEX idx_name ON table_name(column1, column2);
```

## Dependencies

The files must be executed in order due to foreign key dependencies:

1. **01_authentication.sql** - No dependencies (base tables)
2. **02_products.sql** - Depends on: categories (self-referencing)
3. **03_cart.sql** - Depends on: users, products
4. **04_addresses.sql** - Depends on: users
5. **05_orders.sql** - Depends on: users, addresses, products
6. **06_payments.sql** - Depends on: orders
7. **07_invoices.sql** - Depends on: orders
8. **08_user_profile.sql** - Depends on: users
9. **09_triggers.sql** - Depends on: orders, addresses
10. **10_views.sql** - Depends on: orders, users, order_items, cart
11. **11_indexes.sql** - Depends on: orders, products, cart

## Best Practices

1. **Always backup** before making schema changes
2. **Test changes** in a development environment first
3. **Use transactions** when making multiple related changes
4. **Document changes** in migration files if using version control
5. **Keep modules independent** - each file should be self-contained
6. **Follow naming conventions** - use consistent prefixes and suffixes

## Migration Strategy

For production deployments, consider:
- Creating migration scripts for schema changes
- Using version control for schema files
- Testing migrations on staging first
- Having rollback scripts ready

## Support

For questions or issues:
1. Check the comments in each SQL file
2. Review the foreign key relationships
3. Verify execution order matches dependencies
4. Check MySQL error logs for specific issues

