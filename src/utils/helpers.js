const crypto = require('crypto');
const ApiError = require('./apiError');const ejs = require('ejs');
const path = require('path');
const fs = require('fs/promises');

async function compileTemplate(templateName, data) {
  try {
    const templatePath = path.join(__dirname, `../views/emails/${templateName}.ejs`);
    const template = await fs.readFile(templatePath, 'utf-8');
    return ejs.render(template, data);
  } catch (error) {
    throw new Error(`Template rendering failed: ${error.message}`);
  }
}

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
  paginate,
  compileTemplate
};