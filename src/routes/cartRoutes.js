const express = require('express');
const Joi = require('joi');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate, validateParams } = require('../middlewares/validation');

router.use(authenticate);

router.get('/', cartController.viewCart);
router.post('/add', validate('addToCart'), cartController.addItem);
router.put('/update', validate('updateCartItem'), cartController.updateItem);
router.delete('/item/:cart_id', validateParams(Joi.object({ cart_id: Joi.number().integer().positive().required() })), cartController.removeItem);
router.delete('/clear', cartController.clearAll);

module.exports = router;
