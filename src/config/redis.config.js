const redis = require('redis');
const logger = require('../utils/logger');

// Create Redis client with better error handling and retry strategy
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      const delay = Math.min(retries * 100, 5000);
      if (retries > 10) {
        logger.error('Redis connection retries exhausted');
        return new Error('Max retries reached');
      }
      return delay;
    },
  },
});

// Event handlers
redisClient.on('connect', () => {
  logger.info('Connecting to Redis...');
});

redisClient.on('ready', () => {
  logger.info('✅ Redis connected and ready');
});

redisClient.on('error', (err) => {
  logger.error(`Redis error: ${err.message}`);
});

redisClient.on('end', () => {
  logger.warn('Redis connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('Reconnecting to Redis...');
});

// Connect to Redis with retry logic
const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error(`Failed to connect to Redis: ${err.message}`);
    throw err;
  }
};

// Cache operations with better error handling
const setCache = async (key, value, expiration = 3600) => {
  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: expiration,
    });
  } catch (error) {
    logger.error(`Redis set error: ${error.message}`);
    throw error;
  }
};

const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Redis get error: ${error.message}`);
    throw error;
  }
};

const delCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error(`Redis delete error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  redisClient,
  connectRedis,
  setCache,
  getCache,
  delCache,
};