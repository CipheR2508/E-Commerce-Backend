const pool = require('../config/db');

exports.getCategories = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT category_id, name, slug, parent_category_id, image_url
    FROM categories
    WHERE is_active = TRUE
    ORDER BY display_order ASC
  `);

  res.json({
    success: true,
    data: rows
  });
};
