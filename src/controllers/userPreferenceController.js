const {
  getPreferences,
  getPreferenceByKey,
  upsertPreference,
  deletePreference
} = require('../services/userPreferenceService');

/**
 * GET /api/v1/preferences
 */
exports.getAll = async (req, res) => {
  const userId = req.user.user_id;
  const prefs = await getPreferences(userId);

  res.json({
    success: true,
    data: prefs
  });
};

/**
 * GET /api/v1/preferences/:key
 */
exports.getOne = async (req, res) => {
  const userId = req.user.user_id;
  const key = req.params.key;

  const pref = await getPreferenceByKey(userId, key);
  if (!pref) {
    return res.status(404).json({
      success: false,
      error: { message: 'Preference not found' }
    });
  }

  res.json({
    success: true,
    data: pref
  });
};

/**
 * POST /api/v1/preferences
 */
exports.upsert = async (req, res) => {
  const userId = req.user.user_id;
  const { preference_key, preference_value } = req.body;

  if (!preference_key) {
    return res.status(400).json({
      success: false,
      error: { message: 'preference_key is required' }
    });
  }

  await upsertPreference(userId, preference_key, preference_value);

  res.json({
    success: true,
    message: 'Preference saved'
  });
};

/**
 * DELETE /api/v1/preferences/:key
 */
exports.remove = async (req, res) => {
  const userId = req.user.user_id;
  const key = req.params.key;

  const deleted = await deletePreference(userId, key);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: { message: 'Preference not found' }
    });
  }

  res.json({
    success: true,
    message: 'Preference deleted'
  });
};
