const Joi = require("joi");

const reportIdSchema = Joi.object({
  reportId: Joi.string().required(),
});

module.exports = {
  reportIdSchema,
};