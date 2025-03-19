const Joi = require('joi');

const vendorSchema = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().min(6).required(),
  mobile: Joi.string().pattern(/^\+\d{1,15}$/).required().trim(),
  address: Joi.string().required().trim(),
  approvedCategories: Joi.array().items(Joi.string()).required()
});

const vendorUpdateSchema = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().email().trim().lowercase(),
  password: Joi.string().min(6),
  mobile: Joi.string().pattern(/^\+\d{1,15}$/).trim(),
  address: Joi.string().trim(),
  approvedCategories: Joi.array().items(Joi.string())
});

const vendorIdSchema = Joi.object({
  vendorId: Joi.string().required()
});

module.exports = {
  vendorSchema,
  vendorUpdateSchema,
  vendorIdSchema
};