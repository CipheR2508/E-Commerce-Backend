const {
  listAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress
} = require('../services/addressService');

/**
 * GET /api/v1/addresses
 */
exports.getAll = async (req, res) => {
  const userId = req.user.user_id;
  const addresses = await listAddresses(userId);

  res.json({
    success: true,
    data: addresses
  });
};

/**
 * GET /api/v1/addresses/:address_id
 */
exports.getOne = async (req, res) => {
  const userId = req.user.user_id;
  const addressId = parseInt(req.params.address_id);

  const address = await getAddressById(userId, addressId);
  if (!address) {
    return res.status(404).json({
      success: false,
      error: { message: 'Address not found' }
    });
  }

  res.json({
    success: true,
    data: address
  });
};

/**
 * POST /api/v1/addresses
 */
exports.create = async (req, res) => {
  const userId = req.user.user_id;
  const addressData = req.body;

  // Required fields validation
  const required = [
    'full_name', 'phone', 'address_line1',
    'city', 'state', 'postal_code', 'country'
  ];
  for (let field of required) {
    if (!addressData[field]) {
      return res.status(400).json({
        success: false,
        error: { message: `${field} is required` }
      });
    }
  }

  const newId = await createAddress(userId, addressData);

  res.status(201).json({
    success: true,
    message: 'Address created',
    data: { address_id: newId }
  });
};

/**
 * PUT /api/v1/addresses/:address_id
 */
exports.update = async (req, res) => {
  const userId = req.user.user_id;
  const addressId = parseInt(req.params.address_id);
  const addressData = req.body;

  const updated = await updateAddress(userId, addressId, addressData);
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { message: 'Address not found or no changes applied' }
    });
  }

  res.json({
    success: true,
    message: 'Address updated'
  });
};

/**
 * DELETE /api/v1/addresses/:address_id
 */
exports.remove = async (req, res) => {
  const userId = req.user.user_id;
  const addressId = parseInt(req.params.address_id);

  const deleted = await deleteAddress(userId, addressId);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: { message: 'Address not found' }
    });
  }

  res.json({
    success: true,
    message: 'Address deleted'
  });
};
