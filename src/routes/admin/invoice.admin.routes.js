const express = require('express');
const router = express.Router();

const { authenticate } = require('../../middlewares/authMiddleware');
const requireAdmin = require('../../middlewares/requireAdmin');
const db = require('../../config/db');

/**
 * POST /api/v1/admin/invoices
 * Create a new invoice for an order
 */
router.post(
  '/invoices',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { order_id } = req.body;

      if (!order_id) {
        return res.status(400).json({
          success: false,
          error: { message: 'order_id is required' }
        });
      }

      // Validate order exists
      const [orderRows] = await db.query(
        `SELECT order_id, total_amount FROM orders WHERE order_id = ?`,
        [order_id]
      );

      if (orderRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { message: 'Order not found' }
        });
      }

      // Construct an invoice number
      const invoiceNum = `INV-${order_id}-${Date.now()}`;

      // Save invoice
      const [result] = await db.query(
        `
        INSERT INTO invoices (order_id, invoice_number)
        VALUES (?, ?)
        `,
        [order_id, invoiceNum]
      );

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        invoice_id: result.insertId,
        invoice_number: invoiceNum
      });

    } catch (err) {
      console.error('Create invoice error:', err);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create invoice' }
      });
    }
  }
);

/**
 * PATCH /api/v1/admin/invoices/:id/reissue
 * Reissue invoice
 */
router.patch(
  '/invoices/:id/reissue',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const [invoiceRows] = await db.query(
        `SELECT invoice_id, order_id FROM invoices WHERE invoice_id = ?`,
        [id]
      );

      if (invoiceRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { message: 'Invoice not found' }
        });
      }

      // Create a new invoice number
      const newInvoiceNum = `INV-${invoiceRows[0].order_id}-${Date.now()}`;

      await db.query(
        `
        UPDATE invoices
        SET invoice_number = ?, updated_at = CURRENT_TIMESTAMP
        WHERE invoice_id = ?
        `,
        [newInvoiceNum, id]
      );

      res.json({
        success: true,
        message: 'Invoice reissued successfully',
        invoice_number: newInvoiceNum
      });

    } catch (err) {
      console.error('Reissue invoice error:', err);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to reissue invoice' }
      });
    }
  }
);

/**
 * GET /api/v1/admin/invoices/:id
 * Get invoice details
 */
router.get(
  '/invoices/:id',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const [rows] = await db.query(
        `
        SELECT invoice_id, order_id, invoice_number, file_url, created_at
        FROM invoices
        WHERE invoice_id = ?
        `,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { message: 'Invoice not found' }
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });

    } catch (err) {
      console.error('Get invoice error:', err);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch invoice' }
      });
    }
  }
);

module.exports = router;
