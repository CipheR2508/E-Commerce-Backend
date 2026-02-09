const pool = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * Get user profile
 */
exports.getProfile = async (userId) => {
  const [[user]] = await pool.query(
    `SELECT user_id, email, first_name, last_name, phone,
            is_email_verified, is_active, created_at, updated_at
     FROM users
     WHERE user_id = ?`,
    [userId]
  );

  return user;
};

/**
 * Update profile info
 */
exports.updateProfile = async (userId, data) => {
  const allowedFields = ['first_name', 'last_name', 'phone'];
  const updates = [];
  const values = [];

  for (let key of allowedFields) {
    if (data[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(data[key]);
    }
  }

  if (updates.length === 0) return 0;

  values.push(userId);

  const [result] = await pool.query(
    `UPDATE users SET ${updates.join(', ')}
     WHERE user_id = ?`,
    values
  );

  return result.affectedRows;
};

/**
 * Change password
 */
exports.changePassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  const [[user]] = await pool.query(
    `SELECT password_hash FROM users WHERE user_id = ?`,
    [userId]
  );

  if (!user) throw new Error('USER_NOT_FOUND');

  const isValid = await bcrypt.compare(
    currentPassword,
    user.password_hash
  );

  if (!isValid) throw new Error('INVALID_PASSWORD');

  const newHash = await bcrypt.hash(newPassword, 10);

  await pool.query(
    `UPDATE users SET password_hash = ? WHERE user_id = ?`,
    [newHash, userId]
  );
};

/**
 * Deactivate account
 */
exports.deactivateAccount = async (userId) => {
  await pool.query(
    `UPDATE users SET is_active = FALSE WHERE user_id = ?`,
    [userId]
  );
};
