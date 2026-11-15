const Joi = require('joi');

const createEventSchema = Joi.object({
  title: Joi.string().trim().max(120).required().messages({
    'string.empty': 'Event title is required',
    'any.required': 'Event title is required'
  }),
  description: Joi.string().trim().required().messages({
    'string.empty': 'Event description is required',
    'any.required': 'Event description is required'
  }),
  category: Joi.string()
    .valid(
      'Technology',
      'Cultural',
      'Sports',
      'Academic',
      'Career',
      'Workshop',
      'Clubs and Orgs',
      'Networking',
      'Other'
    )
    .default('Cultural'),
  date: Joi.date().iso().required().messages({
    'date.base': 'Please provide a valid event date',
    'any.required': 'Event date is required'
  }),
  time: Joi.string().trim().required().messages({
    'string.empty': 'Event time is required',
    'any.required': 'Event time is required'
  }),
  venue: Joi.string().trim().required().messages({
    'string.empty': 'Venue is required',
    'any.required': 'Venue is required'
  }),
  organizer: Joi.string().trim().allow('').default('Student Council'),
  capacity: Joi.number().integer().min(1).default(100).messages({
    'number.min': 'Capacity must be at least 1 seat'
  }),
  imageUrl: Joi.string().trim().allow('').default(''),
  perks: Joi.array().items(Joi.string().trim()).default([])
});

const updateEventSchema = Joi.object({
  title: Joi.string().trim().max(120).optional(),
  description: Joi.string().trim().optional(),
  category: Joi.string()
    .valid(
      'Technology',
      'Cultural',
      'Sports',
      'Academic',
      'Career',
      'Workshop',
      'Clubs and Orgs',
      'Networking',
      'Other'
    )
    .optional(),
  date: Joi.date().iso().optional(),
  time: Joi.string().trim().optional(),
  venue: Joi.string().trim().optional(),
  organizer: Joi.string().trim().allow('').optional(),
  capacity: Joi.number().integer().min(1).optional(),
  imageUrl: Joi.string().trim().allow('').optional(),
  perks: Joi.array().items(Joi.string().trim()).optional()
});

module.exports = {
  createEventSchema,
  updateEventSchema
};
