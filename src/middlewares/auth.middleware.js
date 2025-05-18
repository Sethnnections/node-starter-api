const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');
const { redisClient } = require('../config/redis.config');
const TokenService = require('../services/token.service');



const protect = async (req, res, next) => {
  try {
    let token;
    // Check for token in cookies first
    if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } 
    // Fallback to Authorization header
    else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError.unauthorized('Not authorized, no token provided');
    }

    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`bl_${token}`);
    if (isBlacklisted) {
      throw new ApiError.unauthorized('Token revoked');
    }

    const decoded = TokenService.verifyToken(token);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new ApiError.unauthorized('User belonging to this token no longer exists');
    }

    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      throw new ApiError.unauthorized('User recently changed password. Please log in again.');
    }

    req.user = currentUser;
    next();
  } catch (error) {
    // Handle JWT expiration specifically for frontend redirect
    if (error.name === 'TokenExpiredError') {
      return res.status(401).render('auth/login', {
        message: 'Your session has expired. Please log in again.'
      });
    }
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    if (token) {
      await TokenService.blacklistToken(token);
      res.clearCookie('accessToken');
    }
    next();
  } catch (error) {
    next(error);1
  }
};


module.exports = {
  protect,
  logout
};