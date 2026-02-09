exports.buildProductQuery = (params) => {
  let sql = `
    SELECT p.product_id, p.name, p.slug, p.price, p.compare_at_price,
           p.rating_average, p.stock_quantity,
           pi.image_url
    FROM products p
    LEFT JOIN product_images pi
      ON p.product_id = pi.product_id AND pi.is_primary = TRUE
    INNER JOIN categories c ON p.category_id = c.category_id
    WHERE p.is_active = TRUE
  `;

  const values = [];

  if (params.search) {
    sql += ` AND MATCH(p.name, p.description, p.short_description) AGAINST (?)`;
    values.push(params.search);
  }

  if (params.category) {
    sql += ` AND c.slug = ?`;
    values.push(params.category);
  }

  if (params.min_price) {
    sql += ` AND p.price >= ?`;
    values.push(params.min_price);
  }

  if (params.max_price) {
    sql += ` AND p.price <= ?`;
    values.push(params.max_price);
  }

  if (params.featured === 'true') {
    sql += ` AND p.is_featured = TRUE`;
  }

  return { sql, values };
};
