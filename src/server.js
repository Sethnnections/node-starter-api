const app = require('./app');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const { redisClient } = require('./config/redis.config');

// Environment variables validation
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'REDIS_URL',
  'SESSION_SECRET',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 3000;

// Database and cache connections
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('✅ MongoDB connected successfully');

    // 2. Verify Redis connection
    await redisClient.ping();
    logger.info('✅ Redis connected successfully');

    // 3. Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

    // 4. Graceful shutdown
    const shutdown = async () => {
      logger.info('🛑 Shutting down server...');
      server.close(async () => {
        await mongoose.disconnect();
        await redisClient.quit();
        logger.info('🔌 All connections closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();