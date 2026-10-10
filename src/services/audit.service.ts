import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

export interface CreateAuditLogParams {
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
}

export class AuditService {
  async record(params: CreateAuditLogParams) {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: params.actorId || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId || null,
          details: params.details || {},
          ipAddress: params.ipAddress || null,
        },
      });
      logger.info(`[Audit] Action '${params.action}' on ${params.entityType}:${params.entityId || 'N/A'} by ${params.actorId || 'SYSTEM'}`);
    } catch (err) {
      logger.error('[Audit] Failed to create audit log entry:', err);
    }
  }

  async getLogs(page = 1, limit = 50, entityType?: string) {
    const skip = (page - 1) * limit;
    const where = entityType ? { entityType } : {};

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, email: true, role: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const auditService = new AuditService();
