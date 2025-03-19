const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
  mobile: Joi.string().pattern(/^\+\d{1,15}$/).required().trim(),
  password: Joi.string().min(6).required(),
  gender: Joi.string().valid("male", "female", "other").required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase(),
  mobile: Joi.string().pattern(/^\+\d{1,15}$/).trim(),
  password: Joi.string().required()
}).xor('email', 'mobile'); // Ensure either email or mobile is provided, but not both

const updateProfileSchema = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().email().trim().lowercase(),
  mobile: Joi.string().pattern(/^\+\d{1,15}$/).trim(),
  gender: Joi.string().valid("male", "female", "other")
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema
};