const ApiResponse = require('../utils/apiResponse');

const notFoundHandler = (req, res, next) => {
  return ApiResponse.error(res, `Route not found - ${req.originalUrl}`, [], 404);
};

module.exports = notFoundHandler;
