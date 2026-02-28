const {
  getCartItems,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../services/cartService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.viewCart = async (req, res) => {
  const userId = req.user.user_id;
  const items = await getCartItems(userId);

  return sendSuccess(res, { message: 'Cart fetched', data: items });
};

exports.addItem = async (req, res) => {
  const userId = req.user.user_id;
  const { product_id, quantity, price } = req.body;

  await addToCart(userId, product_id, quantity, price);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Product added to cart'
  });
};

exports.updateItem = async (req, res) => {
  const userId = req.user.user_id;
  const { cart_id, quantity } = req.body;

  const updated = await updateCartItem(userId, cart_id, quantity);
  if (!updated) {
    return sendError(res, { statusCode: 404, message: 'Cart item not found' });
  }

  return sendSuccess(res, { message: 'Cart updated' });
};

exports.removeItem = async (req, res) => {
  const userId = req.user.user_id;
  const { cart_id } = req.params;

  const removed = await removeCartItem(userId, cart_id);
  if (!removed) {
    return sendError(res, { statusCode: 404, message: 'Cart item not found' });
  }

  return sendSuccess(res, { message: 'Item removed' });
};

exports.clearAll = async (req, res) => {
  const userId = req.user.user_id;
  await clearCart(userId);

  return sendSuccess(res, { message: 'Cart cleared' });
};
