const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().required().trim()
});

const categoryIdSchema = Joi.object({
  categoryId: Joi.string().required()
});

module.exports = {
  categorySchema,
  categoryIdSchema
};