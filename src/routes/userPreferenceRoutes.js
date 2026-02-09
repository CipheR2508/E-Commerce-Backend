const express = require('express');
const router = express.Router();
const controller = require('../controllers/userPreferenceController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Get all preferences
router.get('/', controller.getAll);

// Get one preference
router.get('/:key', controller.getOne);

// Create / Update preference
router.post('/', controller.upsert);

// Delete preference
router.delete('/:key', controller.remove);

module.exports = router;
