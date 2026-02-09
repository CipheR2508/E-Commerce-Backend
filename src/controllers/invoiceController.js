const {
  generateInvoice,
  getInvoiceByOrder
} = require('../services/invoiceService');

/**
 * POST /api/v1/invoices/generate
 */
exports.createInvoice = async (req, res) => {
  const userId = req.user.user_id;
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({
      success: false,
      error: { message: 'order_id is required' }
    });
  }

  try {
    const invoice = await generateInvoice(userId, order_id);

    res.status(201).json({
      success: true,
      message: 'Invoice generated',
      data: invoice
    });

  } catch (err) {
    if (err.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { message: 'Order not found' }
      });
    }

    if (err.message === 'PAYMENT_NOT_COMPLETED') {
      return res.status(400).json({
        success: false,
        error: { message: 'Payment not completed for this order' }
      });
    }

    if (err.message === 'INVOICE_ALREADY_EXISTS') {
      return res.status(409).json({
        success: false,
        error: { message: 'Invoice already exists for this order' }
      });
    }

    throw err;
  }
};

/**
 * GET /api/v1/invoices/order/:order_id
 */
exports.getInvoice = async (req, res) => {
  const userId = req.user.user_id;
  const orderId = parseInt(req.params.order_id);

  const invoice = await getInvoiceByOrder(userId, orderId);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: { message: 'Invoice not found' }
    });
  }

  res.json({
    success: true,
    data: invoice
  });
};
