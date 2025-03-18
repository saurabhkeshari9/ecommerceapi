const Joi = require('joi');

const AdminloginSchema = Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required()
  });

const UserId = Joi.object({
    id: Joi.string().required()
  });

  module.exports = {
    AdminloginSchema,
    UserId
  };
