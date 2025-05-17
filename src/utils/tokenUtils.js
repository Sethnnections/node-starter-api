const jwt = require('jsonwebtoken');
const ApiError = require('./apiError');
const logger = require('./logger');

const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    throw new ApiError.unauthorized('Invalid or expired token');
  }
};

const generateAuthTokens = async (user) => {
  const accessToken = generateToken({ id: user._id, role: user.role });
  const refreshToken = generateToken({ id: user._id }, '7d');

  return { accessToken, refreshToken };
};

module.exports = {
  generateToken,
  verifyToken,
  generateAuthTokens
};