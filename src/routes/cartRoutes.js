const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/', cartController.viewCart);

router.post('/add', cartController.addItem);

router.put('/update', cartController.updateItem);

router.delete('/item/:cart_id', cartController.removeItem);

router.delete('/clear', cartController.clearAll);

module.exports = router;
