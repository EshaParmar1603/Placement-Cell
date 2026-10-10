import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { auditService } from '../services/audit.service.js';
import { sendSuccess } from '../utils/response.js';
import { AccountStatus, UserRole } from '@prisma/client';
import { BadRequestError } from '../utils/appError.js';
import { getParam } from '../utils/params.js';

export class AdminController {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, status, page, limit } = req.query as any;
      const result = await adminService.listUsers({
        role,
        status,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      });
      return sendSuccess(res, result.users, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const id = getParam(req, 'id');
      if (!Object.values(AccountStatus).includes(status)) {
        throw new BadRequestError(`Invalid status: ${status}`);
      }

      const updated = await adminService.updateUserStatus(req.user!.id, id, status);
      return sendSuccess(res, updated, 'User account status updated');
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      const id = getParam(req, 'id');
      if (!Object.values(UserRole).includes(role)) {
        throw new BadRequestError(`Invalid role: ${role}`);
      }

      const updated = await adminService.updateUserRole(req.user!.id, id, role);
      return sendSuccess(res, updated, 'User role updated');
    } catch (error) {
      next(error);
    }
  }

  async verifyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const type = getParam(req, 'type') as 'alumni' | 'mentor';
      const profileId = getParam(req, 'profileId');
      const { isVerified } = req.body;

      const updated = await adminService.verifyAlumniOrMentor(req.user!.id, type, profileId, isVerified ?? true);
      return sendSuccess(res, updated, `${type} verification updated`);
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, entityType } = req.query as any;
      const result = await auditService.getLogs(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 50,
        entityType
      );
      return sendSuccess(res, result.logs, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getSystemConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const key = getParam(req, 'key');
      const config = await adminService.getSystemConfig(key);
      return sendSuccess(res, config);
    } catch (error) {
      next(error);
    }
  }

  async updateSystemConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const key = getParam(req, 'key');
      const { value, description } = req.body;
      const updated = await adminService.updateSystemConfig(req.user!.id, key, value, description);
      return sendSuccess(res, updated, 'System configuration saved');
    } catch (error) {
      next(error);
    }
  }

  async hidePost(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const { isHidden } = req.body;
      const updated = await adminService.hidePost(req.user!.id, id, isHidden ?? true);
      return sendSuccess(res, updated, 'Post visibility updated');
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
