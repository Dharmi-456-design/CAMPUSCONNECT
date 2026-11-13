const ApiResponse = require('../utils/apiResponse');

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return ApiResponse.error(res, 'Access denied. Admin role required.', [], 403);
};

module.exports = adminOnly;
