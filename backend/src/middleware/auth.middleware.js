const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiResponse = require('../utils/apiResponse');
const User = require('../models/User');

/**
 * Protect routes: verifies JWT in Authorization Bearer header
 * Attaches authenticated user object to req.user
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return ApiResponse.error(res, 'Not authorized, no token provided', [], 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return ApiResponse.error(res, 'Not authorized, user not found', [], 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token expired, please login again', [], 401);
    }
    return ApiResponse.error(res, 'Not authorized, token invalid', [], 401);
  }
};

/**
 * Role-based authorization middleware: restricts endpoint access by role
 * e.g. authorize('admin'), authorize('admin', 'faculty')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Not authorized, please authenticate first', [], 401);
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `User role '${req.user.role}' is not authorized to access this resource`,
        [],
        403
      );
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
};
