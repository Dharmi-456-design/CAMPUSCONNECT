const Joi = require('joi');

const createNoteSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'string.empty': 'Note title is required'
  }),
  description: Joi.string().trim().allow('').optional(),
  subject: Joi.string().trim().required().messages({
    'string.empty': 'Subject is required'
  }),
  branch: Joi.string().trim().required().messages({
    'string.empty': 'Branch is required'
  }),
  semester: Joi.number().integer().min(1).max(10).required().messages({
    'number.base': 'Semester must be a valid number'
  }),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ).optional()
});

const updateNoteSchema = Joi.object({
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().allow('').optional(),
  subject: Joi.string().trim().optional(),
  branch: Joi.string().trim().optional(),
  semester: Joi.number().integer().min(1).max(10).optional(),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ).optional()
});

const rateNoteSchema = Joi.object({
  score: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Rating score must be at least 1',
    'number.max': 'Rating score cannot exceed 5'
  })
});

module.exports = {
  createNoteSchema,
  updateNoteSchema,
  rateNoteSchema
};
