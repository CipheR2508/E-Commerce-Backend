/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error responses
 */

const handleError = (err, req, res, next) => {
  // Log error for debugging (don't log in production or use proper logger)
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err);
  }

  // Default error values
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = null;

  // Handle specific error types
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Resource already exists';
  }

  if (err.code === 'ER_NO_REFERENCED_ROW') {
    statusCode = 400;
    message = 'Referenced resource not found';
  }

  if (err.code === 'ER_BAD_FIELD_ERROR') {
    statusCode = 400;
    message = 'Invalid field name';
  }

  // MySQL connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    statusCode = 503;
    message = 'Database connection error';
  }

  // Syntax errors (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON format';
  }

  // Validation errors from express-validator (if used)
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.array().map(e => ({
      field: e.param,
      message: e.msg
    }));
  }

  // Custom application errors
  const customErrors = {
    'CART_EMPTY': { status: 400, message: 'Cart is empty' },
    'ORDER_NOT_FOUND': { status: 404, message: 'Order not found' },
    'ORDER_ALREADY_PAID': { status: 409, message: 'Order already paid' },
    'PAYMENT_NOT_FOUND': { status: 404, message: 'Payment not found' },
    'PAYMENT_NOT_COMPLETED': { status: 400, message: 'Payment not completed for this order' },
    'INVOICE_ALREADY_EXISTS': { status: 409, message: 'Invoice already exists for this order' },
    'INVALID_PASSWORD': { status: 401, message: 'Current password is incorrect' },
    'USER_NOT_FOUND': { status: 404, message: 'User not found' }
  };

  if (customErrors[err.message]) {
    statusCode = customErrors[err.message].status;
    message = customErrors[err.message].message;
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production') {
    if (statusCode === 500) {
      message = 'Internal server error';
    }
  }

  // Build response
  const response = {
    success: false,
    error: {
      message: message,
      ...(errors && { details: errors }),
      ...(process.env.NODE_ENV !== 'production' && {
        stack: err.stack,
        code: err.code
      })
    }
  };

  res.status(statusCode).json(response);
};

/**
 * Async handler wrapper
 * Automatically catches errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 * Catches requests to undefined routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
};

module.exports = {
  handleError,
  asyncHandler,
  notFoundHandler
};
