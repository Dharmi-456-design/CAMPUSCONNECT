const Joi = require('joi');

const createSubjectSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(2).max(20).required().messages({
    'string.empty': 'Subject code is required',
    'any.required': 'Subject code is required'
  }),
  name: Joi.string().trim().min(2).max(120).required().messages({
    'string.empty': 'Subject name is required',
    'any.required': 'Subject name is required'
  }),
  credits: Joi.number().integer().min(1).max(12).default(3).messages({
    'number.min': 'Credits must be at least 1',
    'number.max': 'Credits cannot exceed 12'
  }),
  semester: Joi.number().integer().min(1).max(10).default(1).messages({
    'number.min': 'Semester must be between 1 and 10',
    'number.max': 'Semester must be between 1 and 10'
  }),
  department: Joi.string().trim().allow('').default('Computer Science & Engineering'),
  instructor: Joi.string().trim().allow('').default(''),
  grade: Joi.string().trim().allow('').default('A'),
  color: Joi.string().trim().default('#10B981'),
  category: Joi.string().valid('my_subjects', 'main_hub').default('my_subjects'),
  description: Joi.string().trim().allow('').default('')
});

const updateSubjectSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(2).max(20).optional(),
  name: Joi.string().trim().min(2).max(120).optional(),
  credits: Joi.number().integer().min(1).max(12).optional(),
  semester: Joi.number().integer().min(1).max(10).optional(),
  department: Joi.string().trim().allow('').optional(),
  instructor: Joi.string().trim().allow('').optional(),
  grade: Joi.string().trim().allow('').optional(),
  color: Joi.string().trim().optional(),
  category: Joi.string().valid('my_subjects', 'main_hub').optional(),
  description: Joi.string().trim().allow('').optional()
});

module.exports = {
  createSubjectSchema,
  updateSubjectSchema
};
