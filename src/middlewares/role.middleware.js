const ApiError = require('../utils/apiError');

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      if (req.accepts('html')) {
        return res.status(403).render('errors/403', { 
          title: 'Forbidden',
          message: 'You do not have permission to access this resource'
        });
      }
      throw new ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
};

module.exports = roleMiddleware;