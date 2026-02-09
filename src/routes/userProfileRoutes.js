const express = require('express');
const router = express.Router();
const controller = require('../controllers/userProfileController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Get profile
router.get('/', controller.getMyProfile);

// Update profile
router.put('/', controller.updateMyProfile);

// Change password
router.put('/change-password', controller.changeMyPassword);

// Deactivate account
router.delete('/', controller.deactivate);

module.exports = router;
