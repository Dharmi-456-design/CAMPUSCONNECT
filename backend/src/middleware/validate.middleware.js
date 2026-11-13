const ApiResponse = require('../utils/apiResponse');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    if (!error) {
      return next();
    }
    const errors = error.details.map((detail) => detail.message);
    return ApiResponse.error(res, 'Validation Error', errors, 400);
  };
};

module.exports = validate;
