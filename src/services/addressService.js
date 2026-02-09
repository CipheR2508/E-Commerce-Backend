const pool = require('../config/db');

/**
 * List all user addresses
 */
exports.listAddresses = async (userId) => {
  const [rows] = await pool.query(
    `SELECT * FROM addresses
     WHERE user_id = ?
     ORDER BY is_default DESC, updated_at DESC`,
    [userId]
  );
  return rows;
};

/**
 * Get a single address
 */
exports.getAddressById = async (userId, addressId) => {
  const [[row]] = await pool.query(
    `SELECT * FROM addresses
     WHERE user_id = ? AND address_id = ?`,
    [userId, addressId]
  );
  return row;
};

/**
 * Create new address, ensure default uniqueness
 */
exports.createAddress = async (userId, addressData) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // If new default, unset existing
    if (addressData.is_default) {
      await conn.query(
        `UPDATE addresses SET is_default = FALSE
         WHERE user_id = ?`,
        [userId]
      );
    }

    const fields = [
      'user_id', 'address_type', 'full_name', 'phone',
      'address_line1', 'address_line2',
      'city', 'state', 'postal_code', 'country', 'is_default'
    ];
    const values = [
      userId,
      addressData.address_type || 'home',
      addressData.full_name,
      addressData.phone,
      addressData.address_line1,
      addressData.address_line2 || null,
      addressData.city,
      addressData.state,
      addressData.postal_code,
      addressData.country,
      addressData.is_default ? 1 : 0
    ];

    const [result] = await conn.query(
      `INSERT INTO addresses (${fields.join(',')})
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values
    );

    await conn.commit();
    return result.insertId;
  } finally {
    conn.release();
  }
};

/**
 * Update an address
 */
exports.updateAddress = async (userId, addressId, addressData) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // If setting this as default, unset others
    if (addressData.is_default) {
      await conn.query(
        `UPDATE addresses SET is_default = FALSE
         WHERE user_id = ?`,
        [userId]
      );
    }

    const updates = [];
    const params = [];

    for (let key in addressData) {
      updates.push(`${key} = ?`);
      params.push(addressData[key]);
    }

    params.push(userId, addressId);

    const [result] = await conn.query(
      `UPDATE addresses SET ${updates.join(', ')}
       WHERE user_id = ? AND address_id = ?`,
      params
    );

    await conn.commit();
    return result.affectedRows;
  } finally {
    conn.release();
  }
};

/**
 * Delete an address
 */
exports.deleteAddress = async (userId, addressId) => {
  const [result] = await pool.query(
    `DELETE FROM addresses
     WHERE user_id = ? AND address_id = ?`,
    [userId, addressId]
  );
  return result.affectedRows;
};
