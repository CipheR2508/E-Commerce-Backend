const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const requireAdmin = require('../../middlewares/requireAdmin');
const db = require('../../config/db');

// GET /api/v1/admin/inventory/low-stock
router.get(
  '/inventory/low-stock',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const [products] = await db.query(`
        SELECT product_id, name, sku, stock_quantity
        FROM products
        WHERE stock_quantity <= low_stock_threshold
        ORDER BY stock_quantity ASC
      `);
      res.json({ success: true, data: products });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Failed to fetch low stock products' } });
    }
  }
);

// PATCH /api/v1/admin/inventory/products/:id/stock
router.patch(
  '/inventory/products/:id/stock',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { stock_quantity } = req.body;

      if (typeof stock_quantity !== 'number') {
        return res.status(400).json({ success: false, error: { message: 'stock_quantity must be a number' } });
      }

      const [result] = await db.query(
        `
        UPDATE products
        SET stock_quantity = ?
        WHERE product_id = ?
        `,
        [stock_quantity, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: { message: 'Product not found' } });
      }

      res.json({ success: true, message: 'Stock updated successfully' });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Failed to update stock' } });
    }
  }
);

module.exports = router;
