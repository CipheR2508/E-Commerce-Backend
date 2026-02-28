const jwt = require("jsonwebtoken");
const { sendError } = require('../utils/apiResponse');

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, { statusCode: 401, message: 'Authorization required' });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.role) {
      return sendError(res, { statusCode: 401, message: 'Invalid token payload' });
    }

    req.user = {
      user_id: decoded.user_id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch {
    return sendError(res, { statusCode: 401, message: 'Invalid or expired token' });
  }
};
