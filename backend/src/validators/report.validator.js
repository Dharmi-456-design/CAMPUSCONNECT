const Joi = require('joi');

const createReportSchema = Joi.object({
  targetType: Joi.string().valid('user', 'note', 'doubt', 'listing', 'teamPost').required().messages({
    'any.only': 'Target type must be user, note, doubt, listing, or teamPost'
  }),
  targetId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Target ID is required'
  }),
  reason: Joi.string().trim().required().messages({
    'string.empty': 'Reason is required'
  })
});

const blockUserSchema = Joi.object({
  blockedUserId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Blocked user ID is required'
  })
});

module.exports = {
  createReportSchema,
  blockUserSchema
};
