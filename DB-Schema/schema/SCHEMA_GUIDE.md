# Database Schema Understanding Guide

## When to Execute the Installation Script

### ✅ Execute `install.bat` when:
1. **Setting up a NEW database** - First time installation
2. **Fresh start** - Creating a clean database from scratch
3. **Development environment** - Setting up your local dev database
4. **Testing** - Need to recreate the schema for testing

### ❌ Do NOT execute when:
1. **Database already exists** - It will try to create tables that may already exist
2. **Production database with data** - This will fail if tables exist (unless you drop them first)
3. **Just making changes** - Use individual SQL files or migration scripts instead

## Step-by-Step: Understanding the Schema

### 1. Start with Authentication (01_authentication.sql)
**Purpose**: User accounts and security

**Tables**:
- `users` - Main user accounts (email, password, name, etc.)
- `password_reset_tokens` - For "Forgot Password" feature
- `email_verification_tokens` - For email verification

**Key Fields**:
- `user_id` - Unique identifier for each user
- `email` - Login email (unique)
- `password_hash` - Encrypted password
- `is_email_verified` - Whether email is confirmed
- `is_active` - Whether account is active

---

### 2. Products Module (02_products.sql)
**Purpose**: Product catalog and browsing

**Tables**:
- `categories` - Product categories (can have parent categories)
- `products` - Product information (name, price, stock, etc.)
- `product_images` - Multiple images per product
- `product_attributes` - Attributes like "Color", "Size" (for filters)
- `product_attribute_values` - Actual values (e.g., "Red", "Large")

**Key Relationships**:
- Products belong to Categories
- Products can have multiple Images
- Products can have multiple Attributes (for filtering)

**Example Flow**:
```
Category: "Electronics" 
  └─ Product: "iPhone 15"
      ├─ Images: [img1.jpg, img2.jpg]
      └─ Attributes: 
          ├─ Color: "Black"
          └─ Storage: "256GB"
```

---

### 3. Cart Module (03_cart.sql)
**Purpose**: Shopping cart functionality

**Tables**:
- `cart` - Items users add to their cart

**Key Features**:
- Each user can have multiple products in cart
- `price_at_added` - Saves price when added (in case price changes)
- `quantity` - How many of each product

**Example**:
```
User 1's Cart:
  - Product A: 2 items @ $10 each
  - Product B: 1 item @ $25 each
```

---

### 4. Addresses Module (04_addresses.sql)
**Purpose**: Shipping and billing addresses

**Tables**:
- `addresses` - User addresses (home, work, etc.)

**Key Features**:
- Users can have multiple addresses
- `is_default` - One default address per user (enforced by trigger)
- Used for both shipping and billing

---

### 5. Orders Module (05_orders.sql)
**Purpose**: Order management and tracking

**Tables**:
- `orders` - Main order information
- `order_items` - Individual products in each order
- `order_status_history` - Complete history of status changes

**Order Status Flow**:
```
pending → confirmed → processing → shipped → delivered
                                    ↓
                                 cancelled/refunded
```

**Key Features**:
- `order_number` - Unique order identifier (e.g., "ORD-2024-001")
- Stores shipping and billing addresses (snapshot at time of order)
- Tracks payment status separately from order status
- Complete audit trail in `order_status_history`

**Example Order**:
```
Order #ORD-001
  User: john@example.com
  Items:
    - iPhone 15 (x1) = $999
    - Case (x2) = $40
  Total: $1,039
  Status: shipped
```

---

### 6. Payments Module (06_payments.sql)
**Purpose**: Payment transaction tracking

**Tables**:
- `payments` - Payment records

**Key Features**:
- Links to orders
- Stores transaction ID from payment gateway
- Tracks payment status (pending, completed, failed, refunded)
- Stores gateway response for debugging

---

### 7. Invoices Module (07_invoices.sql)
**Purpose**: Invoice generation and storage

**Tables**:
- `invoices` - Invoice records

**Key Features**:
- One invoice per order
- Stores file path/URL for generated PDF invoices
- `invoice_number` - Unique invoice identifier

---

### 8. User Profile Module (08_user_profile.sql)
**Purpose**: User preferences and settings

**Tables**:
- `user_preferences` - Flexible key-value storage for user settings

**Key Features**:
- Extensible - can store any preference
- Examples: theme, language, notification settings

---

### 9. Triggers (09_triggers.sql)
**Purpose**: Automatic database actions

**Triggers**:
1. `trg_order_status_history` - Automatically logs status changes
2. `trg_single_default_address` - Ensures only one default address per user

**What they do**:
- Run automatically when data changes
- No manual intervention needed

---

### 10. Views (10_views.sql)
**Purpose**: Pre-built queries for common operations

**Views**:
- `vw_user_orders_summary` - Quick order overview with user info
- `vw_user_cart_summary` - Cart totals per user

**Usage**:
```sql
-- Instead of writing complex JOIN queries, just:
SELECT * FROM vw_user_orders_summary WHERE user_id = 1;
```

---

### 11. Indexes (11_indexes.sql)
**Purpose**: Performance optimization

**What they do**:
- Speed up common queries
- Composite indexes for frequently queried column combinations
- Automatically used by database when needed

---

## How Tables Connect (Relationships)

```
users (1) ──→ (many) cart
users (1) ──→ (many) addresses
users (1) ──→ (many) orders
users (1) ──→ (many) user_preferences

categories (1) ──→ (many) products
products (1) ──→ (many) product_images
products (1) ──→ (many) product_attribute_values
products (1) ──→ (many) cart
products (1) ──→ (many) order_items

orders (1) ──→ (many) order_items
orders (1) ──→ (many) order_status_history
orders (1) ──→ (1) payments
orders (1) ──→ (1) invoices

addresses (1) ──→ (many) orders (as shipping_address)
addresses (1) ──→ (many) orders (as billing_address)
```

---

## Common Operations

### User Signs Up
1. Insert into `users` table
2. Generate token in `email_verification_tokens`
3. Send verification email

### User Browses Products
1. Query `products` table (with filters from `product_attributes`)
2. Join with `product_images` for images
3. Join with `categories` for category info

### User Adds to Cart
1. Insert/Update `cart` table
2. Save current product price in `price_at_added`

### User Checks Out
1. Create `order` record
2. Copy cart items to `order_items`
3. Link shipping/billing `addresses`
4. Create `payment` record
5. Clear `cart` for that user

### Order Status Changes
1. Update `orders.status`
2. Trigger automatically adds to `order_status_history`

---

## Next Steps

1. **Read each SQL file** - Start with 01_authentication.sql
2. **Understand the relationships** - See how tables connect
3. **Test queries** - Try SELECT queries on each table
4. **When ready to install** - Use `install.bat` on a fresh database

---

## Quick Reference: File Execution Order

```
01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11
 │    │    │    │    │    │    │    │    │    │    │
 │    │    │    │    │    │    │    │    │    │    └─ Indexes (needs all tables)
 │    │    │    │    │    │    │    │    │    └────── Views (needs tables)
 │    │    │    │    │    │    │    │    └─────────── Triggers (needs tables)
 │    │    │    │    │    │    │    └──────────────── Profile (needs users)
 │    │    │    │    │    │    └───────────────────── Invoices (needs orders)
 │    │    │    │    │    └────────────────────────── Payments (needs orders)
 │    │    │    │    └─────────────────────────────── Orders (needs users, addresses, products)
 │    │    │    └──────────────────────────────────── Addresses (needs users)
 │    │    └────────────────────────────────────────── Cart (needs users, products)
 │    └──────────────────────────────────────────────── Products (needs categories)
 └────────────────────────────────────────────────────── Authentication (base - no dependencies)
```

