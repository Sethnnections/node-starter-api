const Joi = require('joi');

const updateProfile = {
  body: Joi.object().keys({
    firstName: Joi.string().min(2).max(30),
    lastName: Joi.string().min(2).max(30),
    email: Joi.string().email()
  })
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.string().required()
  }),
  body: Joi.object().keys({
    firstName: Joi.string().min(2).max(30),
    lastName: Joi.string().min(2).max(30),
    email: Joi.string().email(),
    role: Joi.string().valid('user', 'supervisor', 'admin'),
    active: Joi.boolean()
  })
};

const getUsers = {
  query: Joi.object().keys({
    role: Joi.string().valid('user', 'supervisor', 'admin'),
    active: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100),
    page: Joi.number().integer().min(1)
  })
};

module.exports = {
  updateProfile,
  updateUser,
  getUsers
};