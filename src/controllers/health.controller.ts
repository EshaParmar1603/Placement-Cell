import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

export class HealthController {
  async getHealth(_req: Request, res: Response) {
    const startTime = Date.now();
    let dbStatus = 'healthy';
    let dbLatencyMs = 0;

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - startTime;
    } catch (err: any) {
      dbStatus = 'degraded';
    }

    const memoryUsage = process.memoryUsage();

    return sendSuccess(res, {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      memory: {
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
      },
      environment: process.env.NODE_ENV || 'development',
    });
  }
}

export const healthController = new HealthController();
