# E-Commerce Backend Project

## Project Status: Core Backend Completed (User-Facing)

This repository contains the backend implementation of an **E-Commerce system**, built step-by-step using **Node.js, Express, and MySQL**. As of now, all **core user-facing modules** have been designed, implemented, and tested.

This README reflects the system **up to the current milestone**.

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL (InnoDB, transactional)
- **Authentication**: JWT (Bearer Tokens)
- **Architecture**: Layered (Routes → Controllers → Services)
- **API Style**: RESTful, versioned (`/api/v1`)

---

## Implemented Modules (Completed)

### ✅ Module 1: Authentication

Handles user identity and access control.

**Features**:
- User signup with password hashing
- Email verification flow
- Login with JWT token issuance
- Forgot password & reset password
- Secure authentication middleware

**Core Tables**:
- `users`
- `email_verification_tokens`
- `password_reset_tokens`

---

### ✅ Module 2: Product Browsing

Supports all customer-facing product discovery features.

**Features**:
- Category listing (hierarchical)
- Product listing with pagination
- Search (full-text)
- Filters (category, price, featured)
- Product detail view
- Product images & attributes

**Core Tables**:
- `categories`
- `products`
- `product_images`
- `product_attributes`
- `product_attribute_values`

---

### ✅ Module 3: Cart Management

Allows authenticated users to manage their shopping cart.

**Features**:
- View cart items
- Add product to cart
- Update quantity
- Remove item from cart
- Clear entire cart

**Key Design Notes**:
- One cart per user
- Price snapshot stored at time of addition
- Fully JWT-protected

**Core Table**:
- `cart`

---

### ✅ Module 4: Address Management

Manages shipping and billing addresses for users.

**Features**:
- Create, update, delete addresses
- List all user addresses
- Single default address enforcement
- Address ownership validation

**Core Table**:
- `addresses`

---

### ✅ Module 5: Orders

Handles conversion of cart into an immutable order.

**Features**:
- Place order from cart (transactional)
- Order number generation
- Order items snapshot
- Order status tracking
- Order history per user
- View order details

**Key Guarantees**:
- Atomic operations (transactions)
- Cart cleared after successful order
- Full audit trail via status history

**Core Tables**:
- `orders`
- `order_items`
- `order_status_history`

---

### ✅ Module 6: Payments

Records and manages payment attempts and outcomes.

**Features**:
- Payment initiation for an order
- Transaction ID generation
- Payment status updates (mock gateway)
- Synchronization with order payment status

**Design Notes**:
- Gateway-agnostic (Stripe/Razorpay ready)
- One payment per order
- Fully transactional

**Core Table**:
- `payments`

---

### ✅ Module 7: Invoices

Handles invoice creation and access post-payment.

**Features**:
- One invoice per order
- Invoice number generation
- Invoice metadata storage (file path / URL)
- Secure invoice retrieval

**Core Table**:
- `invoices`

---

## Completed Transaction Flow

```
User Signup/Login
      ↓
Browse Products
      ↓
Add to Cart
      ↓
Manage Addresses
      ↓
Place Order
      ↓
Initiate Payment
      ↓
Generate Invoice
```

This represents a **complete customer-side e-commerce backend**.

---

## What Is NOT Implemented Yet (By Design)

These are **intentionally excluded** and considered optional extensions:

- Admin panel APIs (product/order management)
- Real payment gateway integration
- Refund & cancellation workflows
- Stock deduction & inventory alerts
- Coupons / discounts
- Wishlist
- Notifications

---

## Project Quality Highlights

- Clean separation of concerns
- Schema-driven API design
- Strong referential integrity
- JWT-secured endpoints
- Transaction-safe operations
- Production-aligned architecture

---

## Recommended Next Steps (Optional)

Depending on goals:

- Add Admin APIs
- Add automated tests (Jest + Supertest)
- Add input validation (Joi / Zod)
- Generate Swagger/OpenAPI docs
- Prepare deployment (Docker, Nginx)

---

## Summary

At this point, the project represents a **fully functional, real-world e-commerce backend** suitable for:

- Learning backend architecture
- Portfolio projects
- Interview discussion
- Extension into a production system

No core user-facing functionality is missing.

