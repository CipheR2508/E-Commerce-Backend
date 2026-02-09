const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Generate invoice
router.post('/generate', invoiceController.createInvoice);

// Get invoice by order
router.get('/order/:order_id', invoiceController.getInvoice);

module.exports = router;
