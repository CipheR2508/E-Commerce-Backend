const {
  createOrderFromCart,
  getUserOrders,
  getOrderDetails
} = require('../services/orderService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.placeOrder = async (req, res) => {
  const userId = req.user.user_id;
  const {
    shipping_address_id,
    billing_address_id,
    payment_method,
    notes
  } = req.body;

  try {
    const order = await createOrderFromCart(
      userId,
      shipping_address_id,
      billing_address_id,
      payment_method,
      notes
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Order placed successfully',
      data: order
    });
  } catch (err) {
    if (err.message === 'CART_EMPTY') {
      return sendError(res, { statusCode: 400, message: 'Cart is empty' });
    }

    throw err;
  }
};

exports.listOrders = async (req, res) => {
  const userId = req.user.user_id;
  const orders = await getUserOrders(userId);

  return sendSuccess(res, { message: 'Orders fetched', data: orders });
};

exports.getOrder = async (req, res) => {
  const userId = req.user.user_id;
  const orderId = parseInt(req.params.order_id, 10);

  const order = await getOrderDetails(userId, orderId);
  if (!order) {
    return sendError(res, { statusCode: 404, message: 'Order not found' });
  }

  return sendSuccess(res, { message: 'Order fetched', data: order });
};
