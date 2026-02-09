# Admin Responsibility Guide
_E-Commerce Backend System_

---

## 1. Purpose of This Document

This document clearly defines **what an Admin is allowed to do** in this e-commerce system.

It exists to:
- Prevent security mistakes
- Avoid feature creep
- Keep backend logic clean and predictable
- Ensure admins do not accidentally break business rules

This guide is **mandatory reading before building Admin APIs or UI**.

---

## 2. Core Mental Model (Very Important)

### ❗ Admin Panel is NOT a separate backend

Admin access is a **privileged layer on top of the SAME backend**.

### Same for Users & Admins
- Same database
- Same tables
- Same business logic
- Same orders, products, users

### What is Different
- Authorization rules
- API access scope
- Data visibility
- Allowed actions

> **Admin = User + Extra Permissions**

---

## 3. Admin Scope (Locked Responsibilities)

Admins are allowed to manage **only the areas listed below**.  
Anything not listed here is **out of scope**.

---

## 4. Product & Category Management

### What Admins CAN Do

- Create new categories
- Update category details
- Enable / disable categories
- Manage parent–child category structure
- Create products
- Update product details:
  - Name
  - Description
  - Price
  - Discount price
  - SKU
  - Visibility
- Upload and manage product images
- Manage product attributes (size, color, etc.)
- Feature / unfeature products

### What Admins CANNOT Do

- Delete products that are linked to orders
- Modify product data that would break order history

### Related Tables
- `categories`
- `products`
- `product_images`
- `product_attributes`
- `product_attribute_values`

---

## 5. Inventory Management

### What Admins CAN Do

- Increase or decrease product stock
- Set low-stock thresholds
- View low-stock and out-of-stock products
- Temporarily disable products due to inventory issues

### What Admins CANNOT Do

- Modify cart quantities directly
- Override checkout stock validation

### Related Tables
- `products`

---

## 6. Order Management

### What Admins CAN Do

- View all orders in the system
- View order details and items
- Update order status:
  - confirmed
  - processing
  - shipped
  - delivered
  - cancelled
  - refunded
- Add internal notes
- Track full order status history

### What Admins CANNOT Do

- Change order prices
- Change ordered products
- Delete orders
- Bypass order lifecycle rules

### Related Tables
- `orders`
- `order_items`
- `order_status_history`

---

## 7. Payment & Refund Management

### What Admins CAN Do

- View payment records
- View payment status
- Initiate refunds (after gateway confirmation)
- Investigate failed or pending payments
- View payment gateway responses

### What Admins CANNOT Do

- Mark unpaid orders as paid manually
- Modify transaction amounts
- Fake payment confirmations

### Related Tables
- `payments`

---

## 8. User Management (Support-Level Only)

### What Admins CAN Do

- View user profiles
- View user order history
- Enable or disable user accounts
- Assist users with account-related issues

### What Admins CANNOT Do

- Change user passwords
- Log in as a user
- Modify email verification status manually
- Access sensitive authentication tokens

### Related Tables
- `users`
- `user_preferences`
- (Read-only access to `orders`, `addresses`)

---

## 9. Invoice Management

### What Admins CAN Do

- Generate invoices for completed orders
- Reissue invoices if needed
- Access invoice file paths and URLs

### What Admins CANNOT Do

- Generate invoices without valid orders
- Modify invoice numbers manually
- Delete invoices tied to orders

### Related Tables
- `invoices`
- `orders`

---

## 10. What Admins Are Explicitly NOT Allowed To Do

Admins do **NOT** have permission to:

- Place orders as customers
- Modify carts
- Modify addresses
- Change order totals
- Bypass database constraints
- Disable triggers
- Access authentication tokens
- Directly edit database records

---

## 11. Security Philosophy

- **Admins are not superusers**
- **Every admin action must be auditable**
- **Database constraints must always win**
- **Business rules are never bypassed**

> Admin power exists to **manage**, not to **override** the system.

---

## 12. Final Summary

- One backend
- One database
- One set of rules
- Different permission levels

This responsibility guide is the **foundation** for:
- Admin authentication
- Role-based access control (RBAC)
- Admin API design
- Admin dashboard UI

---

**End of Document**
