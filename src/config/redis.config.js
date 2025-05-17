const redis = require('redis');
const logger = require('../utils/logger');

let redisClient;

(async () => {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL
  });

  redisClient.on('error', (error) => {
    logger.error(`Redis error: ${error}`);
  });

  redisClient.on('connect', () => {
    logger.info('Connected to Redis');
  });

  await redisClient.connect();
})();

const setCache = async (key, value, expiration = 3600) => {
  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: expiration
    });
  } catch (error) {
    logger.error(`Redis set error: ${error}`);
  }
};

const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Redis get error: ${error}`);
    return null;
  }
};

const delCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error(`Redis delete error: ${error}`);
  }
};

module.exports = {
  redisClient,
  setCache,
  getCache,
  delCache
};