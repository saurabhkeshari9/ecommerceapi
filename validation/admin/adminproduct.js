const Joi = require('joi');

const productIdSchema = Joi.object({
  productId: Joi.string().required()
});

module.exports = {
  productIdSchema
};