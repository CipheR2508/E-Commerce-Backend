const express = require('express');
const router = express.Router();

const { authenticate } = require('../../middlewares/authMiddleware');
const requireAdmin = require('../../middlewares/requireAdmin');
const db = require('../../config/db');

/**
 * POST /api/v1/admin/categories
 * Create category
 */
router.post(
  '/categories',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { name, slug, parent_category_id } = req.body;

      if (!name || !slug) {
        return res.status(400).json({
          success: false,
          error: { message: 'Name and slug are required' }
        });
      }

      const [result] = await db.query(
        `
        INSERT INTO categories (name, slug, parent_category_id)
        VALUES (?, ?, ?)
        `,
        [name, slug, parent_category_id || null]
      );

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category_id: result.insertId
      });

    } catch (err) {
      console.error('Create category error:', err);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create category' }
      });
    }
  }
);

/**
 * PUT /api/v1/admin/categories/:id
 * Update category
 */
router.put(
  '/categories/:id',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, slug, parent_category_id } = req.body;

      const [result] = await db.query(
        `
        UPDATE categories
        SET
          name = COALESCE(?, name),
          slug = COALESCE(?, slug),
          parent_category_id = COALESCE(?, parent_category_id)
        WHERE category_id = ?
        `,
        [name, slug, parent_category_id, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { message: 'Category not found' }
        });
      }

      res.json({
        success: true,
        message: 'Category updated successfully'
      });

    } catch (err) {
      console.error('Update category error:', err);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update category' }
      });
    }
  }
);

/**
 * PATCH /api/v1/admin/categories/:id/status
 * Enable / disable category
 */
router.patch(
  '/categories/:id/status',
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
        UPDATE categories
        SET is_active = ?
        WHERE category_id = ?
        `,
        [is_active, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { message: 'Category not found' }
        });
      }

      res.json({
        success: true,
        message: `Category ${is_active ? 'enabled' : 'disabled'} successfully`
      });

    } catch (err) {
      console.error('Toggle category status error:', err);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update category status' }
      });
    }
  }
);

/**
 * GET /api/v1/admin/categories/tree
 * Returns nested category tree
 */
router.get(
  '/categories/tree',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT
          category_id,
          name,
          slug,
          parent_category_id,
          is_active
        FROM categories
        ORDER BY display_order ASC, name ASC
      `);

      // Build a map of categories by id
      const categoryMap = {};
      rows.forEach(cat => {
        categoryMap[cat.category_id] = {
          ...cat,
          children: []
        };
      });

      // Build the tree
      const tree = [];
      rows.forEach(cat => {
        if (cat.parent_category_id === null) {
          // Root category
          tree.push(categoryMap[cat.category_id]);
        } else if (categoryMap[cat.parent_category_id]) {
          // Child category
          categoryMap[cat.parent_category_id].children.push(
            categoryMap[cat.category_id]
          );
        }
      });

      res.json({
        success: true,
        data: tree
      });

    } catch (err) {
      console.error('Fetch category tree error:', err);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch category tree' }
      });
    }
  }
);

/**
 * PATCH /api/v1/admin/products/:productId/category
 * Assign / change category of a product
 */
router.patch(
  '/products/:productId/category',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { category_id } = req.body;

      if (!category_id) {
        return res.status(400).json({
          success: false,
          error: { message: 'category_id is required' }
        });
      }

      // 1️⃣ Check category exists and is active
      const [categories] = await db.query(
        `
        SELECT category_id
        FROM categories
        WHERE category_id = ? AND is_active = TRUE
        `,
        [category_id]
      );

      if (categories.length === 0) {
        return res.status(404).json({
          success: false,
          error: { message: 'Category not found or inactive' }
        });
      }

      // 2️⃣ Update product category
      const [result] = await db.query(
        `
        UPDATE products
        SET category_id = ?
        WHERE product_id = ?
        `,
        [category_id, productId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { message: 'Product not found' }
        });
      }

      res.json({
        success: true,
        message: 'Product category updated successfully'
      });

    } catch (err) {
      console.error('Assign product category error:', err);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to assign product category' }
      });
    }
  }
);


module.exports = router;
