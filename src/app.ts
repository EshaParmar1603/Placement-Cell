import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { correlationMiddleware } from './middlewares/correlation.middleware.js';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import routes from './routes/index.js';
import { swaggerSpec } from './docs/swagger.js';
import { NotFoundError } from './utils/appError.js';

export function createApp() {
  const app = express();

  // 1. Security & Core Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 2. Correlation Tracking & Rate Limiting
  app.use(correlationMiddleware);
  app.use(globalRateLimiter);

  // 3. API Documentation
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/v1/docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // 4. Mount API Routes under /api/v1
  app.use('/api/v1', routes);

  // 5. Unhandled Route (404)
  app.use((req: Request, _res: Response, next) => {
    next(new NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`));
  });

  // 6. Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
