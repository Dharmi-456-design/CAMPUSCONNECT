const Joi = require('joi');

const createDoubtSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'string.empty': 'Doubt title is required'
  }),
  description: Joi.string().trim().required().messages({
    'string.empty': 'Description is required'
  }),
  subject: Joi.string().trim().required().messages({
    'string.empty': 'Subject is required'
  }),
  imageUrl: Joi.string().allow('').optional()
}).unknown(true);

const createAnswerSchema = Joi.object({
  text: Joi.string().trim().required().messages({
    'string.empty': 'Answer text is required'
  })
}).unknown(true);

module.exports = {
  createDoubtSchema,
  createAnswerSchema
};
