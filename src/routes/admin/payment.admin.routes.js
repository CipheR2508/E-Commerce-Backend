const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const requireAdmin = require('../../middlewares/requireAdmin');
const db = require('../../config/db');

// GET /api/v1/admin/payments
router.get(
  '/payments',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const [payments] = await db.query(`
        SELECT payment_id, order_id, amount, status, created_at
        FROM payments
        ORDER BY created_at DESC
      `);
      res.json({ success: true, data: payments });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Failed to fetch payments' } });
    }
  }
);

// PATCH /api/v1/admin/payments/:id/refund
router.patch(
  '/payments/:id/refund',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await db.query(
        `
        UPDATE payments
        SET status = 'refunded'
        WHERE payment_id = ?
        `,
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: { message: 'Payment not found' } });
      }

      res.json({ success: true, message: 'Payment marked refunded' });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Failed to refund payment' } });
    }
  }
);

module.exports = router;
