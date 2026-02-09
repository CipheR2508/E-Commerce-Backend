const pool = require('../config/db');
const { buildProductQuery } = require('../services/productService');

exports.getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;

  const { sql, values } = buildProductQuery(req.query);

  const [products] = await pool.query(
    `${sql} LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  res.json({
    success: true,
    data: products,
    meta: { page, limit }
  });
};

exports.getProductBySlug = async (req, res) => {
  const { slug } = req.params;

  const [[product]] = await pool.query(`
    SELECT *
    FROM products
    WHERE slug = ? AND is_active = TRUE
  `, [slug]);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: { message: 'Product not found' }
    });
  }

  const [images] = await pool.query(`
    SELECT image_url, alt_text, is_primary
    FROM product_images
    WHERE product_id = ?
    ORDER BY display_order ASC
  `, [product.product_id]);

  const [attributes] = await pool.query(`
    SELECT pa.name, pav.value_text, pav.value_number, pav.value_boolean
    FROM product_attribute_values pav
    INNER JOIN product_attributes pa
      ON pav.attribute_id = pa.attribute_id
    WHERE pav.product_id = ?
  `, [product.product_id]);

  res.json({
    success: true,
    data: {
      product,
      images,
      attributes
    }
  });
};
