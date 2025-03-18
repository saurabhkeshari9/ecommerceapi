const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
  mobile: Joi.string().pattern(/^\d{10}$/).required().trim(),
  password: Joi.string().min(6).required(),
  gender: Joi.string().valid("male", "female", "other").required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().email().trim().lowercase(),
  mobile: Joi.string().pattern(/^\d{10}$/).trim(),
  gender: Joi.string().valid("male", "female", "other")
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema
};