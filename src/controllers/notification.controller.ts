import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import { sendSuccess } from '../utils/response.js';
import { getParam } from '../utils/params.js';

export class NotificationController {
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query as any;
      const result = await notificationService.getMyNotifications(
        req.user!.id,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20
      );
      return sendSuccess(res, result.notifications, undefined, 200, {
        unreadCount: result.unreadCount,
        ...result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      await notificationService.markAsRead(id, req.user!.id);
      return sendSuccess(res, { message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      return sendSuccess(res, { message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
