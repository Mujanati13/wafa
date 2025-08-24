const validate = (schema) => {
  return (req, res, next) => {


    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body is empty or undefined"
      });
    }

    const { error } = schema.validate(req.body, { abortEarly: false }); // abortEarly:false → shows all errors
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((err) => err.message),
      });
    }
    next();
  };
};

export default validate;