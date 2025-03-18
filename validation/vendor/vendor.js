const Joi = require('joi');

const vendorLoginSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().required()
});

const productSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().required().trim(),
  price: Joi.number().required(),
  category: Joi.string().required()
});

const productIdSchema = Joi.object({
  productId: Joi.string().required()
});

module.exports = {
  vendorLoginSchema,
  productSchema,
  productIdSchema
};