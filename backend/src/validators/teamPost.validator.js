const Joi = require('joi');

const createTeamPostSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'string.empty': 'Title is required'
  }),
  description: Joi.string().trim().required().messages({
    'string.empty': 'Description is required'
  }),
  department: Joi.string().trim().optional().allow(''),
  requiredSkills: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ).optional(),
  teamSizeMax: Joi.number().integer().min(2).optional().default(4),
  deadline: Joi.any().optional()
}).unknown(true);

const teamRequestStatusSchema = Joi.object({
  status: Joi.string().valid('accepted', 'rejected').required().messages({
    'any.only': 'Status must be either accepted or rejected'
  })
});

module.exports = {
  createTeamPostSchema,
  teamRequestStatusSchema
};
