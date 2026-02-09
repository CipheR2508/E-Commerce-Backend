const pool = require('../config/db');

/**
 * Get all preferences for user
 */
exports.getPreferences = async (userId) => {
  const [rows] = await pool.query(
    `SELECT preference_key, preference_value, updated_at
     FROM user_preferences
     WHERE user_id = ?
     ORDER BY preference_key ASC`,
    [userId]
  );

  return rows;
};

/**
 * Get single preference
 */
exports.getPreferenceByKey = async (userId, key) => {
  const [[row]] = await pool.query(
    `SELECT preference_key, preference_value, updated_at
     FROM user_preferences
     WHERE user_id = ? AND preference_key = ?`,
    [userId, key]
  );

  return row;
};

/**
 * Create or update preference (UPSERT)
 */
exports.upsertPreference = async (userId, key, value) => {
  await pool.query(
    `INSERT INTO user_preferences (user_id, preference_key, preference_value)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       preference_value = VALUES(preference_value),
       updated_at = CURRENT_TIMESTAMP`,
    [userId, key, value]
  );
};

/**
 * Delete preference
 */
exports.deletePreference = async (userId, key) => {
  const [result] = await pool.query(
    `DELETE FROM user_preferences
     WHERE user_id = ? AND preference_key = ?`,
    [userId, key]
  );

  return result.affectedRows;
};
