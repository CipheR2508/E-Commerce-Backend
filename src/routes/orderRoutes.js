const express = require('express');
const Joi = require('joi');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate, validateParams } = require('../middlewares/validation');

router.use(authenticate);

router.post('/', validate('createOrder'), orderController.placeOrder);
router.get('/', orderController.listOrders);
router.get('/:order_id', validateParams(Joi.object({ order_id: Joi.number().integer().positive().required() })), orderController.getOrder);

module.exports = router;
