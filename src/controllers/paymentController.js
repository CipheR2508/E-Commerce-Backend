const {
  createPayment,
  updatePaymentStatus,
  getPaymentsByOrder
} = require('../services/paymentService');

/**
 * POST /api/v1/payments/initiate
 */
exports.initiatePayment = async (req, res) => {
  const userId = req.user.user_id;
  const { order_id, payment_method } = req.body;

  if (!order_id || !payment_method) {
    return res.status(400).json({
      success: false,
      error: { message: 'order_id and payment_method required' }
    });
  }

  try {
    const payment = await createPayment(
      userId,
      order_id,
      payment_method
    );

    res.status(201).json({
      success: true,
      message: 'Payment initiated',
      data: payment
    });

  } catch (err) {
    if (err.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { message: 'Order not found' }
      });
    }

    if (err.message === 'ORDER_ALREADY_PAID') {
      return res.status(409).json({
        success: false,
        error: { message: 'Order already paid' }
      });
    }

    throw err;
  }
};

/**
 * PUT /api/v1/payments/:payment_id/status
 * (Simulates payment gateway callback)
 */
exports.updateStatus = async (req, res) => {
  const paymentId = parseInt(req.params.payment_id);
  const { status, transaction_id, gateway_response } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: { message: 'status is required' }
    });
  }

  try {
    await updatePaymentStatus(
      paymentId,
      status,
      transaction_id,
      gateway_response
    );

    res.json({
      success: true,
      message: 'Payment status updated'
    });

  } catch (err) {
    if (err.message === 'PAYMENT_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { message: 'Payment not found' }
      });
    }

    throw err;
  }
};

/**
 * GET /api/v1/payments/order/:order_id
 */
exports.getOrderPayments = async (req, res) => {
  const userId = req.user.user_id;
  const orderId = parseInt(req.params.order_id);

  const payments = await getPaymentsByOrder(userId, orderId);

  res.json({
    success: true,
    data: payments
  });
};
