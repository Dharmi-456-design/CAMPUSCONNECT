const Joi = require('joi');

const createLostFoundSchema = Joi.object({
  type: Joi.string()
    .valid('LOST', 'FOUND', 'lost', 'found')
    .insensitive()
    .required()
    .messages({
      'any.required': 'Item type (LOST or FOUND) is required',
      'any.only': 'Item type must be either LOST or FOUND',
    }),
  title: Joi.string().trim().max(120).required().messages({
    'string.empty': 'Item title is required',
    'any.required': 'Item title is required',
  }),
  description: Joi.string().trim().max(1500).required().messages({
    'string.empty': 'Item description is required',
    'any.required': 'Item description is required',
  }),
  category: Joi.string()
    .valid(
      'Electronics',
      'Wallets & Bags',
      'ID Cards',
      'Books & Notes',
      'Keys',
      'Watches & Jewelry',
      'Bottles & Bags',
      'Accessories',
      'Clothing',
      'Other'
    )
    .default('Other'),
  location: Joi.string().trim().max(150).required().messages({
    'string.empty': 'Location is required',
    'any.required': 'Location is required',
  }),
  date: Joi.date().iso().optional().default(() => new Date()),
  status: Joi.string()
    .valid('OPEN', 'CLAIMED', 'RESOLVED', 'open', 'claimed', 'resolved')
    .insensitive()
    .default('OPEN'),
  imageUrl: Joi.string().trim().allow('').default(''),
  contactInfo: Joi.object({
    name: Joi.string().trim().allow('').optional(),
    phone: Joi.string().trim().allow('').optional(),
    email: Joi.string().email().trim().allow('').optional(),
    showPhone: Joi.boolean().default(false),
    showEmail: Joi.boolean().default(true),
  }).optional().default({}),
});

const updateLostFoundSchema = Joi.object({
  title: Joi.string().trim().max(120).optional(),
  description: Joi.string().trim().max(1500).optional(),
  category: Joi.string()
    .valid(
      'Electronics',
      'Wallets & Bags',
      'ID Cards',
      'Books & Notes',
      'Keys',
      'Watches & Jewelry',
      'Bottles & Bags',
      'Accessories',
      'Clothing',
      'Other'
    )
    .optional(),
  location: Joi.string().trim().max(150).optional(),
  date: Joi.date().iso().optional(),
  status: Joi.string()
    .valid('OPEN', 'CLAIMED', 'RESOLVED', 'open', 'claimed', 'resolved')
    .insensitive()
    .optional(),
  imageUrl: Joi.string().trim().allow('').optional(),
  contactInfo: Joi.object({
    name: Joi.string().trim().allow('').optional(),
    phone: Joi.string().trim().allow('').optional(),
    email: Joi.string().email().trim().allow('').optional(),
    showPhone: Joi.boolean().optional(),
    showEmail: Joi.boolean().optional(),
  }).optional(),
});

module.exports = {
  createLostFoundSchema,
  updateLostFoundSchema,
};
