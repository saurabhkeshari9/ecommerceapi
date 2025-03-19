const Joi = require('joi');

const vendorLoginSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  mobile: Joi.string().pattern(/^\+\d{1,15}$/).trim(),
  password: Joi.string().required()
}).xor('email', 'mobile');

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