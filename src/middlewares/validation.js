const Joi = require('joi');
const { sendError } = require('../utils/apiResponse');

// Common validation schemas
const schemas = {
  // Auth schemas
  signup: Joi.object({
    email: Joi.string().email().required().max(255),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),
    first_name: Joi.string().min(1).max(100).required(),
    last_name: Joi.string().min(1).max(100).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  resetPassword: Joi.object({
    token: Joi.string().uuid().required(),
    new_password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .required()
  }),

  // Product schemas
  createProduct: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    slug: Joi.string().pattern(/^[a-z0-9-]+$/).min(2).max(255).required(),
    sku: Joi.string().alphanum().min(3).max(50).required(),
    price: Joi.number().positive().precision(2).required(),
    category_id: Joi.number().integer().positive().required(),
    stock_quantity: Joi.number().integer().min(0).default(0),
    description: Joi.string().max(5000).allow(null, ''),
    short_description: Joi.string().max(500).allow(null, '')
  }),

  updateProduct: Joi.object({
    name: Joi.string().min(2).max(255),
    price: Joi.number().positive().precision(2),
    stock_quantity: Joi.number().integer().min(0),
    description: Joi.string().max(5000).allow(null, ''),
    short_description: Joi.string().max(500).allow(null, '')
  }),

  toggleProductStatus: Joi.object({
    is_active: Joi.boolean().required()
  }),

  // Category schemas
  createCategory: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    slug: Joi.string().pattern(/^[a-z0-9-]+$/).min(2).max(100).required(),
    parent_category_id: Joi.number().integer().positive().allow(null)
  }),

  updateCategory: Joi.object({
    name: Joi.string().min(1).max(100),
    slug: Joi.string().pattern(/^[a-z0-9-]+$/).min(2).max(100),
    parent_category_id: Joi.number().integer().positive().allow(null)
  }),

  toggleCategoryStatus: Joi.object({
    is_active: Joi.boolean().required()
  }),

  assignProductCategory: Joi.object({
    category_id: Joi.number().integer().positive().required()
  }),

  // Cart schemas
  addToCart: Joi.object({
    product_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().min(1).required(),
    price: Joi.number().positive().precision(2).required()
  }),

  updateCartItem: Joi.object({
    cart_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().min(0).required()
  }),

  // Order schemas
  createOrder: Joi.object({
    shipping_address_id: Joi.number().integer().positive().required(),
    billing_address_id: Joi.number().integer().positive().required(),
    payment_method: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'cod').required(),
    notes: Joi.string().max(1000).allow(null, '')
  }),

  // Payment schemas
  initiatePayment: Joi.object({
    order_id: Joi.number().integer().positive().required(),
    payment_method: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'cod').required()
  }),

  updatePaymentStatus: Joi.object({
    status: Joi.string().valid('pending', 'completed', 'failed', 'refunded').required(),
    transaction_id: Joi.string().max(255).allow(null, ''),
    gateway_response: Joi.string().max(2000).allow(null, '')
  }),

  // Invoice schemas
  generateInvoice: Joi.object({
    order_id: Joi.number().integer().positive().required()
  }),

  // Address schemas
  createAddress: Joi.object({
    address_type: Joi.string().valid('home', 'work', 'other').default('home'),
    full_name: Joi.string().min(1).max(200).required(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).min(7).max(20).required(),
    address_line1: Joi.string().min(1).max(255).required(),
    address_line2: Joi.string().max(255).allow(null, ''),
    city: Joi.string().min(1).max(100).required(),
    state: Joi.string().min(1).max(100).required(),
    postal_code: Joi.string().pattern(/^[\w-]+$/).min(3).max(20).required(),
    country: Joi.string().min(2).max(100).required(),
    is_default: Joi.boolean().default(false)
  }),

  updateAddress: Joi.object({
    address_type: Joi.string().valid('home', 'work', 'other'),
    full_name: Joi.string().min(1).max(200),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).min(7).max(20),
    address_line1: Joi.string().min(1).max(255),
    address_line2: Joi.string().max(255).allow(null, ''),
    city: Joi.string().min(1).max(100),
    state: Joi.string().min(1).max(100),
    postal_code: Joi.string().pattern(/^[\w-]+$/).min(3).max(20),
    country: Joi.string().min(2).max(100),
    is_default: Joi.boolean()
  }),

  // Profile schemas
  updateProfile: Joi.object({
    first_name: Joi.string().min(1).max(100),
    last_name: Joi.string().min(1).max(100),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).min(7).max(20).allow(null, '')
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .required()
  }),

  // Preference schemas
  upsertPreference: Joi.object({
    preference_key: Joi.string().min(1).max(100).required(),
    preference_value: Joi.string().max(1000).allow(null, '')
  }),

  // Admin schemas
  updateOrderStatus: Joi.object({
    status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required()
  }),

  updateStock: Joi.object({
    stock_quantity: Joi.number().integer().min(0).required()
  }),

  createAdminInvoice: Joi.object({
    order_id: Joi.number().integer().positive().required()
  })
};

// Validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      console.error(`Validation schema '${schemaName}' not found`);
      return next();
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return sendError(res, { statusCode: 400, message: 'Validation failed', data: errorMessages });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Query parameter validation
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return sendError(res, { statusCode: 400, message: 'Invalid query parameters', data: errorMessages });
    }

    req.query = value;
    next();
  };
};

// URL parameter validation
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return sendError(res, { statusCode: 400, message: 'Invalid URL parameters', data: errorMessages });
    }

    req.params = value;
    next();
  };
};

// Product query validation schema
const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
  search: Joi.string().max(200).allow(''),
  category: Joi.string().pattern(/^[a-z0-9-]+$/).max(100),
  min_price: Joi.number().positive().precision(2),
  max_price: Joi.number().positive().precision(2),
  featured: Joi.string().valid('true', 'false')
});

module.exports = {
  validate,
  validateQuery,
  validateParams,
  schemas,
  productQuerySchema
};
