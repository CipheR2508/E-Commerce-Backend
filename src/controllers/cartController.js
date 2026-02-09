const {
  getCartItems,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../services/cartService');

exports.viewCart = async (req, res) => {
  const userId = req.user.user_id;
  const items = await getCartItems(userId);

  res.json({
    success: true,
    data: items
  });
};

exports.addItem = async (req, res) => {
  const userId = req.user.user_id;
  const { product_id, quantity } = req.body;

  if (!product_id || quantity <= 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'product_id and positive quantity required' }
    });
  }

  const price = req.body.price || null;
  if (price === null) {
    return res.status(400).json({
      success: false,
      error: { message: 'price_at_added required' }
    });
  }

  await addToCart(userId, product_id, quantity, price);

  res.json({
    success: true,
    message: 'Product added to cart'
  });
};

exports.updateItem = async (req, res) => {
  const userId = req.user.user_id;
  const { cart_id, quantity } = req.body;

  if (!cart_id || quantity < 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'cart_id and non-negative quantity required' }
    });
  }

  const updated = await updateCartItem(userId, cart_id, quantity);
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { message: 'Cart item not found' }
    });
  }

  res.json({
    success: true,
    message: 'Cart updated'
  });
};

exports.removeItem = async (req, res) => {
  const userId = req.user.user_id;
  const { cart_id } = req.params;

  const removed = await removeCartItem(userId, cart_id);
  if (!removed) {
    return res.status(404).json({
      success: false,
      error: { message: 'Cart item not found' }
    });
  }

  res.json({
    success: true,
    message: 'Item removed'
  });
};

exports.clearAll = async (req, res) => {
  const userId = req.user.user_id;
  await clearCart(userId);

  res.json({
    success: true,
    message: 'Cart cleared'
  });
};
