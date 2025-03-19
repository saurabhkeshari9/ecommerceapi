const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        statusCode: 400,
        message: "Validation Error",
        errors: error.details.map((err) => err.message),
      });
    }

    next(); // Proceed if validation passes
  };
};

module.exports = validateParams;