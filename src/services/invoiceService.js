const pool = require('../config/db');

const generateInvoiceNumber = () => {
  return 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
};

/**
 * Generate invoice for an order
 */
exports.generateInvoice = async (userId, orderId) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Validate order
    const [[order]] = await conn.query(
      `SELECT order_id, payment_status
       FROM orders
       WHERE order_id = ? AND user_id = ?`,
      [orderId, userId]
    );

    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    if (order.payment_status !== 'paid') {
      throw new Error('PAYMENT_NOT_COMPLETED');
    }

    // 2. Check existing invoice
    const [[existing]] = await conn.query(
      `SELECT invoice_id
       FROM invoices
       WHERE order_id = ?`,
      [orderId]
    );

    if (existing) {
      throw new Error('INVOICE_ALREADY_EXISTS');
    }

    // 3. Generate invoice metadata
    const invoiceNumber = generateInvoiceNumber();

    // Stub paths (real PDF generation later)
    const filePath = `/invoices/${invoiceNumber}.pdf`;
    const fileUrl = `https://cdn.yourapp.com/invoices/${invoiceNumber}.pdf`;

    // 4. Insert invoice
    const [result] = await conn.query(
      `INSERT INTO invoices (
        order_id, invoice_number, file_path, file_url
      ) VALUES (?, ?, ?, ?)`,
      [orderId, invoiceNumber, filePath, fileUrl]
    );

    await conn.commit();

    return {
      invoice_id: result.insertId,
      order_id: orderId,
      invoice_number: invoiceNumber,
      file_path: filePath,
      file_url: fileUrl
    };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Get invoice by order
 */
exports.getInvoiceByOrder = async (userId, orderId) => {
  const [[invoice]] = await pool.query(
    `SELECT i.invoice_id, i.invoice_number,
            i.file_path, i.file_url, i.generated_at
     FROM invoices i
     INNER JOIN orders o ON i.order_id = o.order_id
     WHERE i.order_id = ? AND o.user_id = ?`,
    [orderId, userId]
  );

  return invoice;
};
