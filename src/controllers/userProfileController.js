const {
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount
} = require('../services/userProfileService');

/**
 * GET /api/v1/profile
 */
exports.getMyProfile = async (req, res) => {
  const userId = req.user.user_id;
  const profile = await getProfile(userId);

  res.json({
    success: true,
    data: profile
  });
};

/**
 * PUT /api/v1/profile
 */
exports.updateMyProfile = async (req, res) => {
  const userId = req.user.user_id;
  const updated = await updateProfile(userId, req.body);

  if (!updated) {
    return res.status(400).json({
      success: false,
      error: { message: 'No valid fields to update' }
    });
  }

  res.json({
    success: true,
    message: 'Profile updated'
  });
};

/**
 * PUT /api/v1/profile/change-password
 */
exports.changeMyPassword = async (req, res) => {
  const userId = req.user.user_id;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({
      success: false,
      error: { message: 'Both passwords required' }
    });
  }

  try {
    await changePassword(
      userId,
      current_password,
      new_password
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (err) {
    if (err.message === 'INVALID_PASSWORD') {
      return res.status(401).json({
        success: false,
        error: { message: 'Current password incorrect' }
      });
    }

    throw err;
  }
};

/**
 * DELETE /api/v1/profile
 */
exports.deactivate = async (req, res) => {
  const userId = req.user.user_id;
  await deactivateAccount(userId);

  res.json({
    success: true,
    message: 'Account deactivated'
  });
};
