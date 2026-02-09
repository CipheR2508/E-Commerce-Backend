const {
  createOrderFromCart,
  getUserOrders,
  getOrderDetails
} = require('../services/orderService');

exports.placeOrder = async (req, res) => {
  const userId = req.user.user_id;
  const {
    shipping_address_id,
    billing_address_id,
    payment_method,
    notes
  } = req.body;

  if (!shipping_address_id || !billing_address_id) {
    return res.status(400).json({
      success: false,
      error: { message: 'Shipping and billing address required' }
    });
  }

  try {
    const order = await createOrderFromCart(
      userId,
      shipping_address_id,
      billing_address_id,
      payment_method,
      notes
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });

  } catch (err) {
    if (err.message === 'CART_EMPTY') {
      return res.status(400).json({
        success: false,
        error: { message: 'Cart is empty' }
      });
    }

    throw err;
  }
};

exports.listOrders = async (req, res) => {
  const userId = req.user.user_id;
  const orders = await getUserOrders(userId);

  res.json({
    success: true,
    data: orders
  });
};

exports.getOrder = async (req, res) => {
  const userId = req.user.user_id;
  const orderId = parseInt(req.params.order_id);

  const order = await getOrderDetails(userId, orderId);
  if (!order) {
    return res.status(404).json({
      success: false,
      error: { message: 'Order not found' }
    });
  }

  res.json({
    success: true,
    data: order
  });
};
