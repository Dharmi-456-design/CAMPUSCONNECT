const Joi = require('joi');

const createPostSchema = Joi.object({
  title: Joi.string().trim().max(200).required().messages({
    'string.empty': 'Post title is required',
    'any.required': 'Post title is required',
  }),
  content: Joi.string().trim().max(5000).required().messages({
    'string.empty': 'Post content is required',
    'any.required': 'Post content is required',
  }),
  category: Joi.string()
    .valid(
      'Discussion',
      'Question',
      'Study Group',
      'Hackathon Squad',
      'General',
      'Tech & Coding',
      'Campus Life'
    )
    .default('General'),
  subject: Joi.string().trim().allow('').optional().default(''),
  helpType: Joi.string().valid('community', 'tutor').default('community'),
  tags: Joi.array().items(Joi.string().trim()).default([]),
  imageUrl: Joi.string().trim().allow('').default(''),
});

const updatePostSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  content: Joi.string().trim().max(5000).optional(),
  category: Joi.string()
    .valid(
      'Discussion',
      'Question',
      'Study Group',
      'Hackathon Squad',
      'General',
      'Tech & Coding',
      'Campus Life'
    )
    .optional(),
  subject: Joi.string().trim().allow('').optional(),
  helpType: Joi.string().valid('community', 'tutor').optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  status: Joi.string().valid('open', 'solved', 'closed').optional(),
  imageUrl: Joi.string().trim().allow('').optional(),
});

const createCommentSchema = Joi.object({
  content: Joi.string().trim().max(2000).required().messages({
    'string.empty': 'Comment content cannot be empty',
    'any.required': 'Comment content is required',
  }),
});

module.exports = {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
};
