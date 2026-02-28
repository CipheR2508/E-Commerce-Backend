const { sendError } = require('../utils/apiResponse');

module.exports = function requireAdmin(req, res, next) {
  if (!req.user || !req.user.role) {
    return sendError(res, { statusCode: 401, message: 'Unauthorized access' });
  }

  if (req.user.role !== 'admin') {
    return sendError(res, { statusCode: 403, message: 'Admin access required' });
  }

  next();
};
