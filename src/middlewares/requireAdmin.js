module.exports = function requireAdmin(req, res, next) {
  // authMiddleware must run before this
  if (!req.user || !req.user.role) {
    return res.status(401).json({
      success: false,
      error: { message: 'Unauthorized access' }
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { message: 'Admin access required' }
    });
  }

  next();
};
