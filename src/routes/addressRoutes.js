const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authenticate } = require('../middlewares/authMiddleware');

// All operations require authentication
router.use(authenticate);

// List all addresses
router.get('/', addressController.getAll);

// Get single address
router.get('/:address_id', addressController.getOne);

// Create new address
router.post('/', addressController.create);

// Update existing address
router.put('/:address_id', addressController.update);

// Delete an address
router.delete('/:address_id', addressController.remove);

module.exports = router;
