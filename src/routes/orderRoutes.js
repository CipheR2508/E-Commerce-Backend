const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Place order
router.post('/', orderController.placeOrder);

// List user orders
router.get('/', orderController.listOrders);

// Get single order
router.get('/:order_id', orderController.getOrder);

module.exports = router;
