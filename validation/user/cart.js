const Joi = require('joi');

const addItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required()
});

const productIdSchema = Joi.object({
  productId: Joi.string().required()
});

module.exports = {
  addItemSchema,
  productIdSchema
};