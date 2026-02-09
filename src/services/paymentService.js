const pool = require('../config/db');

/**
 * Initiate payment for an order
 */
exports.createPayment = async (userId, orderId, paymentMethod) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Validate order
    const [[order]] = await conn.query(
      `SELECT order_id, total_amount, payment_status
       FROM orders
       WHERE order_id = ? AND user_id = ?`,
      [orderId, userId]
    );

    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    if (order.payment_status === 'paid') {
      throw new Error('ORDER_ALREADY_PAID');
    }

    // 2. Create payment record
    const [paymentResult] = await conn.query(
      `INSERT INTO payments (
        order_id, payment_method, amount, status
      ) VALUES (?, ?, ?, 'pending')`,
      [orderId, paymentMethod, order.total_amount]
    );

    const paymentId = paymentResult.insertId;

    // 3. Mark order payment as pending
    await conn.query(
      `UPDATE orders SET payment_status = 'pending'
       WHERE order_id = ?`,
      [orderId]
    );

    await conn.commit();

    return {
      payment_id: paymentId,
      order_id: orderId,
      amount: order.total_amount,
      status: 'pending'
    };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Complete or fail payment (gateway simulation)
 */
exports.updatePaymentStatus = async (
  paymentId,
  status,
  transactionId,
  gatewayResponse
) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [[payment]] = await conn.query(
      `SELECT payment_id, order_id
       FROM payments
       WHERE payment_id = ?`,
      [paymentId]
    );

    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND');
    }

    // 1. Update payment
    await conn.query(
      `UPDATE payments
       SET status = ?, transaction_id = ?, gateway_response = ?
       WHERE payment_id = ?`,
      [status, transactionId, gatewayResponse, paymentId]
    );

    // 2. Update order payment status
    const orderPaymentStatus =
      status === 'completed' ? 'paid' :
      status === 'failed' ? 'failed' :
      'pending';

    await conn.query(
      `UPDATE orders
       SET payment_status = ?
       WHERE order_id = ?`,
      [orderPaymentStatus, payment.order_id]
    );

    await conn.commit();

    return true;

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Get payments for an order
 */
exports.getPaymentsByOrder = async (userId, orderId) => {
  const [rows] = await pool.query(
    `SELECT p.payment_id, p.payment_method,
            p.amount, p.currency, p.status,
            p.transaction_id, p.created_at
     FROM payments p
     INNER JOIN orders o ON p.order_id = o.order_id
     WHERE p.order_id = ? AND o.user_id = ?`,
    [orderId, userId]
  );

  return rows;
};
