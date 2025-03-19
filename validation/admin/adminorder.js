const Joi = require('joi');

const orderIdSchema = Joi.object({
  orderId: Joi.string().required()
});

module.exports = {
  orderIdSchema
};