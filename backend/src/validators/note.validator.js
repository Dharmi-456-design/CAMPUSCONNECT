const Joi = require('joi');

const createNoteSchema = Joi.object({
  title: Joi.string().trim().max(200).required().messages({
    'string.empty': 'Note title is required',
    'any.required': 'Note title is required',
    'string.max': 'Note title cannot exceed 200 characters'
  }),
  content: Joi.string().allow('').optional().default(''),
  description: Joi.string().trim().allow('').optional().default(''),
  subject: Joi.string().trim().allow('', null).optional(),
  subjectName: Joi.string().trim().allow('').optional().default('General'),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ).optional().default([]),
  category: Joi.string().trim().allow('').optional().default('General'),
  isPinned: Joi.boolean().optional().default(false),
  isLocked: Joi.boolean().optional().default(false),
  color: Joi.string().trim().optional().default('#16A36A'),
  branch: Joi.string().trim().allow('').optional().default('General'),
  semester: Joi.number().integer().min(1).max(10).optional().default(1),
  fileUrl: Joi.string().trim().allow('').optional().default(''),
  fileType: Joi.string().trim().allow('').optional().default('text')
});

const updateNoteSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  content: Joi.string().allow('').optional(),
  description: Joi.string().trim().allow('').optional(),
  subject: Joi.string().trim().allow('', null).optional(),
  subjectName: Joi.string().trim().allow('').optional(),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ).optional(),
  category: Joi.string().trim().allow('').optional(),
  isPinned: Joi.boolean().optional(),
  isLocked: Joi.boolean().optional(),
  color: Joi.string().trim().optional(),
  branch: Joi.string().trim().allow('').optional(),
  semester: Joi.number().integer().min(1).max(10).optional(),
  fileUrl: Joi.string().trim().allow('').optional(),
  fileType: Joi.string().trim().allow('').optional()
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
