const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');
const { redisClient } = require('../config/redis.config');

class TokenService {
  static generateToken(payload, expiresIn = process.env.JWT_EXPIRES_IN) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      logger.error(`Token verification failed: ${error.message}`);
      throw new ApiError.unauthorized('Invalid or expired token');
    }
  }

  static generateAuthTokens(user) {
    const accessToken = this.generateToken(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
    );
    
    const refreshToken = this.generateToken(
      { id: user._id },
      process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
    );

    return { accessToken, refreshToken };
  }

  static async blacklistToken(token) {
    try {
      const decoded = jwt.decode(token);
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      
      if (ttl > 0) {
        await redisClient.set(`bl_${token}`, 'blacklisted', { EX: ttl });
      }
    } catch (error) {
      logger.error(`Token blacklist failed: ${error.message}`);
      throw new ApiError.internal('Failed to blacklist token');
    }
  }

  static generateRandomToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

module.exports = TokenService;