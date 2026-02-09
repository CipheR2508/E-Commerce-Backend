const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/v1/categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT category_id, name, slug, parent_category_id, is_active
      FROM categories
      WHERE is_active = TRUE
      ORDER BY display_order ASC, name ASC
    `);
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch categories' }
    });
  }
});

// GET /api/v1/categories/tree
router.get('/tree', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT category_id, name, slug, parent_category_id, is_active
      FROM categories
      WHERE is_active = TRUE
      ORDER BY display_order ASC, name ASC
    `);

    const map = {};
    rows.forEach(c => {
      map[c.category_id] = { ...c, children: [] };
    });

    const tree = [];
    rows.forEach(c => {
      if (c.parent_category_id === null) {
        tree.push(map[c.category_id]);
      } else if (map[c.parent_category_id]) {
        map[c.parent_category_id].children.push(map[c.category_id]);
      }
    });

    res.json({ success: true, data: tree });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch category tree' }
    });
  }
});

router.get('/tree', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT category_id, name, slug, parent_category_id, is_active
      FROM categories
      WHERE is_active = TRUE
      ORDER BY display_order ASC, name ASC
    `);

    const map = {};
    rows.forEach(c => map[c.category_id] = { ...c, children: [] });

    const tree = [];
    rows.forEach(c => {
      if (c.parent_category_id === null) {
        tree.push(map[c.category_id]);
      } else if (map[c.parent_category_id]) {
        map[c.parent_category_id].children.push(map[c.category_id]);
      }
    });

    res.json({ success: true, data: tree });
  } catch {
    res.status(500).json({ success: false, error: { message: 'Failed to fetch category tree' } });
  }
});

module.exports = router;
