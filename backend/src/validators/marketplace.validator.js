const Joi = require('joi');

const createListingSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'string.empty': 'Title is required'
  }),
  description: Joi.string().trim().required().messages({
    'string.empty': 'Description is required'
  }),
  category: Joi.string().trim().required().messages({
    'string.empty': 'Category is required'
  }),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price must be a non-negative number'
  }),
  condition: Joi.string().valid('new', 'like_new', 'used', 'fair').optional(),
  location: Joi.string().trim().allow('').optional()
});

const updateListingStatusSchema = Joi.object({
  status: Joi.string().valid('available', 'reserved', 'sold').required().messages({
    'any.only': 'Status must be available, reserved, or sold'
  })
});

module.exports = {
  createListingSchema,
  updateListingStatusSchema
};
