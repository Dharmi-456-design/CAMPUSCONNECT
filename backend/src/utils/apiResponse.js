class ApiResponse {
  static success(res, message = 'Success', data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, message = 'An error occurred', errors = [], statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: Array.isArray(errors) ? errors : [errors],
    });
  }

  static created(res, message = 'Resource created successfully', data = {}) {
    return ApiResponse.success(res, message, data, 201);
  }

  static badRequest(res, message = 'Bad Request', errors = []) {
    return ApiResponse.error(res, message, errors, 400);
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return ApiResponse.error(res, message, [], 401);
  }

  static forbidden(res, message = 'Forbidden') {
    return ApiResponse.error(res, message, [], 403);
  }

  static notFound(res, message = 'Resource not found') {
    return ApiResponse.error(res, message, [], 404);
  }
}

module.exports = ApiResponse;
