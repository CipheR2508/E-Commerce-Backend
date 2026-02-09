const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const requireAdmin = require('../../middlewares/requireAdmin');
const db = require('../../config/db');

// GET /api/v1/admin/orders
router.get(
  '/orders',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const [orders] = await db.query(`
        SELECT order_id, user_id, total_amount, status, created_at
        FROM orders
        ORDER BY created_at DESC
      `);
      res.json({ success: true, data: orders });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Failed to fetch orders' } });
    }
  }
);

// PATCH /api/v1/admin/orders/:id/status
router.patch(
  '/orders/:id/status',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const [result] = await db.query(
        `
        UPDATE orders
        SET status = ?
        WHERE order_id = ?
        `,
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: { message: 'Order not found' } });
      }

      res.json({ success: true, message: 'Order status updated' });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Failed to update status' } });
    }
  }
);

module.exports = router;
