require('dotenv').config(); // MUST BE FIRST

const app = require('./app');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const { redisClient } = require('./config/redis.config');

const requiredEnvVars = [
  'NODE_ENV', 'PORT', 'MONGODB_URI', 'JWT_SECRET', 'REDIS_URL', 'SESSION_SECRET'
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    logger.error(`Missing required env var: ${envVar}`);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ MongoDB connected');

    await redisClient.connect();
    logger.info('✅ Redis connected');

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
    });

    process.on('SIGINT', async () => {
      logger.info('🛑 Graceful shutdown...');
      await mongoose.disconnect();
      await redisClient.quit();
      server.close(() => {
        logger.info('🔌 Closed all connections');
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error(`❌ Server startup failed: ${err.message}`);
    process.exit(1);
  }
};

startServer();
