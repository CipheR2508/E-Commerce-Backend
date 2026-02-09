const pool = require('../config/db');

/**
 * Get cart for user
 */
exports.getCartItems = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT c.cart_id, c.product_id, c.quantity, c.price_at_added,
       p.name, p.slug, p.is_active,
       pi.image_url
     FROM cart c
     INNER JOIN products p ON c.product_id = p.product_id
     LEFT JOIN product_images pi
       ON pi.product_id = p.product_id AND pi.is_primary = TRUE
     WHERE c.user_id = ?`,
    [user_id]
  );

  return rows;
};

exports.addToCart = async (user_id, product_id, quantity, price) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[existing]] = await conn.query(
      `SELECT cart_id, quantity
       FROM cart
       WHERE user_id = ? AND product_id = ?`,
      [user_id, product_id]
    );

    if (existing) {
      const newQty = existing.quantity + quantity;
      await conn.query(
        `UPDATE cart SET quantity = ?, price_at_added = ?
         WHERE cart_id = ?`,
        [newQty, price, existing.cart_id]
      );
      await conn.commit();
      return { updated: true };
    }

    await conn.query(
      `INSERT INTO cart (user_id, product_id, quantity, price_at_added)
       VALUES (?, ?, ?, ?)`,
      [user_id, product_id, quantity, price]
    );

    await conn.commit();
    return { created: true };
  } finally {
    conn.release();
  }
};

exports.updateCartItem = async (user_id, cart_id, quantity) => {
  const [result] = await pool.query(
    `UPDATE cart SET quantity = ?
     WHERE cart_id = ? AND user_id = ?`,
    [quantity, cart_id, user_id]
  );

  return result.affectedRows;
};

exports.removeCartItem = async (user_id, cart_id) => {
  const [result] = await pool.query(
    `DELETE FROM cart
     WHERE cart_id = ? AND user_id = ?`,
    [cart_id, user_id]
  );

  return result.affectedRows;
};

exports.clearCart = async (user_id) => {
  await pool.query(
    `DELETE FROM cart WHERE user_id = ?`,
    [user_id]
  );
};
