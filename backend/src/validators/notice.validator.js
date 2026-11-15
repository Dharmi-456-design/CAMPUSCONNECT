const Joi = require('joi');

const createNoticeSchema = Joi.object({
  title: Joi.string().trim().max(140).required().messages({
    'string.empty': 'Notice title is required',
    'any.required': 'Notice title is required',
    'string.max': 'Notice title cannot exceed 140 characters'
  }),
  content: Joi.string().trim().required().messages({
    'string.empty': 'Notice content is required',
    'any.required': 'Notice content is required'
  }),
  category: Joi.string()
    .valid('Academic', 'Administration', 'Examination', 'Campus', 'Emergency')
    .default('Campus'),
  isImportant: Joi.boolean().default(false),
  department: Joi.string().trim().allow('').default('All Departments')
});

const updateNoticeSchema = Joi.object({
  title: Joi.string().trim().max(140).optional(),
  content: Joi.string().trim().optional(),
  category: Joi.string()
    .valid('Academic', 'Administration', 'Examination', 'Campus', 'Emergency')
    .optional(),
  isImportant: Joi.boolean().optional(),
  department: Joi.string().trim().allow('').optional()
});

module.exports = {
  createNoticeSchema,
  updateNoticeSchema
};
