import { prisma } from '../config/database.js';
import { NotificationType } from '@prisma/client';
import { jobQueue } from './queue/jobQueue.service.js';
import { emailService } from './email/email.service.js';
import { logger } from '../config/logger.js';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  sendEmailNotification?: boolean;
}

export class NotificationService {
  constructor() {
    // Register queue handler for background email dispatch
    jobQueue.registerHandler('send-notification-email', async (jobData: { userId: string; title: string; message: string }) => {
      const user = await prisma.user.findUnique({
        where: { id: jobData.userId },
        select: { email: true, isEmailVerified: true },
      });

      if (!user || !user.email) return;

      const result = await emailService.sendEmail({
        to: user.email,
        subject: `[PlaceWise] ${jobData.title}`,
        text: jobData.message,
      });

      if (result.success) {
        logger.info(`[Notification] Email sent to ${user.email} (MessageId: ${result.messageId})`);
      } else {
        logger.warn(`[Notification] Email failed for ${user.email}: ${result.error}`);
      }
    });
  }

  async create(params: CreateNotificationParams) {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data || {},
        isRead: false,
        emailSent: false,
      },
    });

    if (params.sendEmailNotification) {
      jobQueue.enqueue('send-notification-email', {
        userId: params.userId,
        title: params.title,
        message: params.message,
      });
    }

    return notification;
  }

  async getMyNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async notifyEligibleStudentsForOpportunity(opportunityId: string) {
    const opp = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { company: { select: { name: true } } },
    });

    if (!opp) return;

    // Find students matching criteria
    const eligibleStudents = await prisma.studentProfile.findMany({
      where: {
        cgpa: { gte: opp.minCgpa },
        activeBacklogs: { lte: opp.maxBacklogsAllowed },
        ...(opp.allowedDepartments.length > 0 && {
          department: { in: opp.allowedDepartments },
        }),
        ...(opp.allowedGraduationYears.length > 0 && {
          graduationYear: { in: opp.allowedGraduationYears },
        }),
      },
      select: { userId: true },
    });

    for (const student of eligibleStudents) {
      await this.create({
        userId: student.userId,
        type: NotificationType.OPPORTUNITY_PUBLISHED,
        title: `New Placement Drive: ${opp.title} at ${opp.company.name}`,
        message: `You meet the eligibility criteria for ${opp.title} at ${opp.company.name}. Apply before ${new Date(opp.deadline).toLocaleDateString()}!`,
        data: { opportunityId: opp.id, companyName: opp.company.name },
        sendEmailNotification: true,
      });
    }
  }
}

export const notificationService = new NotificationService();
