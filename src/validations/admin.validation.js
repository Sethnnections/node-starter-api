const Joi = require('joi');

const createUser = {
  body: Joi.object().keys({
    firstName: Joi.string().required().min(2).max(30),
    lastName: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    role: Joi.string().valid('user', 'supervisor', 'admin').default('user')
  })
};

const updateUserRole = {
  params: Joi.object().keys({
    userId: Joi.string().required()
  }),
  body: Joi.object().keys({
    role: Joi.string().valid('user', 'supervisor', 'admin').required()
  })
};

const toggleUserStatus = {
  params: Joi.object().keys({
    userId: Joi.string().required()
  })
};

module.exports = {
  createUser,
  updateUserRole,
  toggleUserStatus
};