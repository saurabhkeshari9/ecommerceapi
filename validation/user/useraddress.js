const Joi = require('joi');

const addressSchema = Joi.object({
  name: Joi.string().required().trim(),
  mobile: Joi.string().pattern(/^\d{10}$/).required().trim(),
  street: Joi.string().required().trim(),
  city: Joi.string().required().trim(),
  state: Joi.string().required().trim(),
  postalCode: Joi.string().pattern(/^\d{6}$/).required().trim()
});

const addressIdSchema = Joi.object({
  addressId: Joi.string().required()
});

module.exports = {
  addressSchema,addressIdSchema
};