const crypto = require('crypto');
const ApiError = require('./apiError');

const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const filterObject = (obj, ...allowedFields) => {
  const filteredObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredObj[key] = obj[key];
    }
  });
  return filteredObj;
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

module.exports = {
  generateRandomString,
  filterObject,
  validateEmail,
  paginate
};