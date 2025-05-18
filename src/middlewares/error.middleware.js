const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const { statusCode, message } = err;
  
  // Log error
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Check if request wants JSON response
  if (req.accepts('json')) {
    res.status(statusCode).json({
      status: 'error',
      statusCode,
      message
    });
  } else {
    // Otherwise render error page
    res.status(statusCode).render(`errors/${statusCode}`, {
      title: `${statusCode} Error`,
      message
    });
  }
};

module.exports = {
  errorConverter,
  errorHandler
};