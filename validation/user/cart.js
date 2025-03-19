const Joi = require('joi');

const addItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required()
});



module.exports = {
  addItemSchema,
};