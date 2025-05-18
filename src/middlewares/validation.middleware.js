const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    if (req.accepts('html')) {
      // For form submissions, redirect back with errors
      req.flash('errors', extractedErrors);
      return res.redirect('back');
    }

    throw new ApiError.badRequest('Validation failed', extractedErrors);
  };
};

module.exports = validate;