const validate = (schema, property = 'body') => { 
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {
      return res.status(400).json({
        statusCode: 400,
        message: error.details.map((detail) => detail.message).join(", "),
        data: {},
      });
    }
    next();
  };
};

module.exports = validate;
