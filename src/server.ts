import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

async function bootstrap() {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      logger.info(`=======================================================`);
      logger.info(` PlaceWise Placement Cell API Server Running `);
      logger.info(` Environment: ${env.NODE_ENV}`);
      logger.info(` Port:        ${env.PORT}`);
      logger.info(` Base URL:    http://localhost:${env.PORT}/api/v1`);
      logger.info(` API Docs:    http://localhost:${env.PORT}/api/v1/docs`);
      logger.info(` Health:      http://localhost:${env.PORT}/api/v1/health`);
      logger.info(`=======================================================`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDatabase();
        process.exit(0);
      });

      // Force close after 10s timeout
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    logger.error('Failed to start PlaceWise server:', err);
    process.exit(1);
  }
}

bootstrap();
