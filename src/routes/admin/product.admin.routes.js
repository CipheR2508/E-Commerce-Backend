const express = require('express');
const router = express.Router();

const { authenticate } = require('../../middlewares/authMiddleware');
const requireAdmin = require('../../middlewares/requireAdmin');
const db = require('../../config/db'); // adjust path if needed

// CREATE PRODUCT
router.post(
  '/products',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        name,
        slug,
        sku,
        price,
        category_id,
        stock_quantity = 0,
        description,
        short_description
      } = req.body;

      if (!name || !slug || !sku || !price || !category_id) {
        return res.status(400).json({
          success: false,
          error: { message: 'Missing required fields' }
        });
      }

      await db.query(
        `
        INSERT INTO products
        (name, slug, sku, price, category_id, stock_quantity, description, short_description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          name,
          slug,
          sku,
          price,
          category_id,
          stock_quantity,
          description || null,
          short_description || null
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Product created successfully'
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create product' }
      });
    }
  }
);

module.exports = router;


// UPDATE PRODUCT
router.put(
  '/products/:id',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        name,
        price,
        stock_quantity,
        description,
        short_description
      } = req.body;

      const [result] = await db.query(
        `
        UPDATE products
        SET
          name = COALESCE(?, name),
          price = COALESCE(?, price),
          stock_quantity = COALESCE(?, stock_quantity),
          description = COALESCE(?, description),
          short_description = COALESCE(?, short_description)
        WHERE product_id = ?
        `,
        [
          name,
          price,
          stock_quantity,
          description,
          short_description,
          id
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { message: 'Product not found' }
        });
      }

      res.json({
        success: true,
        message: 'Product updated successfully'
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update product' }
      });
    }
  }
);


// TOGGLE PRODUCT STATUS
router.patch(
  '/products/:id/status',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      if (typeof is_active !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: { message: 'is_active must be boolean' }
        });
      }

      const [result] = await db.query(
        `
        UPDATE products
        SET is_active = ?
        WHERE product_id = ?
        `,
        [is_active, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { message: 'Product not found' }
        });
      }

      res.json({
        success: true,
        message: `Product ${is_active ? 'enabled' : 'disabled'} successfully`
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update product status' }
      });
    }
  }
);
