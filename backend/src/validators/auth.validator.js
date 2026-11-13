const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Name is required'
  }),
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.empty': 'Password is required'
  }),
  college: Joi.string().trim().allow(''),
  branch: Joi.string().trim().allow(''),
  semester: Joi.number().integer().min(1).max(10).optional(),
  year: Joi.number().integer().min(1).max(6).optional(),
  role: Joi.string().valid('student', 'admin').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required'
  })
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().optional(),
  college: Joi.string().trim().optional(),
  branch: Joi.string().trim().optional(),
  semester: Joi.number().integer().min(1).max(10).optional(),
  year: Joi.number().integer().min(1).max(6).optional(),
  skills: Joi.array().items(Joi.string().trim()).optional(),
  bio: Joi.string().allow('').optional(),
  photoUrl: Joi.string().uri().allow('').optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema
};
