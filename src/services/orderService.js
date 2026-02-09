const pool = require('../config/db');

const generateOrderNumber = () => {
  return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
};

exports.createOrderFromCart = async (
  userId,
  shippingAddressId,
  billingAddressId,
  paymentMethod,
  notes
) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Load cart items
    const [cartItems] = await conn.query(
      `SELECT c.product_id, c.quantity, c.price_at_added,
              p.name, p.sku
       FROM cart c
       INNER JOIN products p ON c.product_id = p.product_id
       WHERE c.user_id = ?`,
      [userId]
    );

    if (cartItems.length === 0) {
      throw new Error('CART_EMPTY');
    }

    // 2. Calculate totals
    let subtotal = 0;
    cartItems.forEach(item => {
      subtotal += item.quantity * item.price_at_added;
    });

    const taxAmount = 0;        // extensible
    const shippingAmount = 0;   // extensible
    const discountAmount = 0;
    const totalAmount =
      subtotal + taxAmount + shippingAmount - discountAmount;

    const orderNumber = generateOrderNumber();

    // 3. Insert order
    const [orderResult] = await conn.query(
      `INSERT INTO orders (
        user_id, order_number, subtotal, tax_amount,
        shipping_amount, discount_amount, total_amount,
        shipping_address_id, billing_address_id,
        payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        orderNumber,
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        shippingAddressId,
        billingAddressId,
        paymentMethod
      ]
    );

    const orderId = orderResult.insertId;

    // 4. Insert order items
    for (const item of cartItems) {
      await conn.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name,
          product_sku, quantity, unit_price, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.name,
          item.sku,
          item.quantity,
          item.price_at_added,
          item.quantity * item.price_at_added
        ]
      );
    }

    // 5. Order status history
    await conn.query(
      `INSERT INTO order_status_history (order_id, status, notes)
       VALUES (?, 'pending', 'Order created')`,
      [orderId]
    );

    // 6. Clear cart
    await conn.query(
      `DELETE FROM cart WHERE user_id = ?`,
      [userId]
    );

    await conn.commit();

    return {
      order_id: orderId,
      order_number: orderNumber,
      total_amount: totalAmount
    };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.getUserOrders = async (userId) => {
  const [rows] = await pool.query(
    `SELECT order_id, order_number, status,
            total_amount, payment_status, created_at
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

exports.getOrderDetails = async (userId, orderId) => {
  const [[order]] = await pool.query(
    `SELECT *
     FROM orders
     WHERE order_id = ? AND user_id = ?`,
    [orderId, userId]
  );

  if (!order) return null;

  const [items] = await pool.query(
    `SELECT product_name, product_sku,
            quantity, unit_price, total_price
     FROM order_items
     WHERE order_id = ?`,
    [orderId]
  );

  const [history] = await pool.query(
    `SELECT status, notes, created_at
     FROM order_status_history
     WHERE order_id = ?
     ORDER BY created_at ASC`,
    [orderId]
  );

  return {
    order,
    items,
    history
  };
};
