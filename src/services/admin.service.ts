import { prisma } from '../config/database.js';
import { AccountStatus, UserRole } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../utils/appError.js';
import { auditService } from './audit.service.js';

export class AdminService {
  async listUsers(params: { role?: UserRole; status?: AccountStatus; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.role) where.role = params.role;
    if (params.status) where.status = params.status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          isEmailVerified: true,
          createdAt: true,
          studentProfile: { select: { fullName: true, enrollmentNumber: true } },
          alumniProfile: { select: { fullName: true, isVerified: true } },
          mentorProfile: { select: { fullName: true, isVerified: true } },
          managerProfile: { select: { fullName: true, designation: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserStatus(adminUserId: string, targetUserId: string, status: AccountStatus) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundError('User not found');

    if (user.id === adminUserId) {
      throw new BadRequestError('Administrators cannot suspend their own account');
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { status },
      select: { id: true, email: true, role: true, status: true },
    });

    await auditService.record({
      actorId: adminUserId,
      action: 'USER_STATUS_UPDATED',
      entityType: 'User',
      entityId: targetUserId,
      details: { previousStatus: user.status, newStatus: status },
    });

    return updated;
  }

  async updateUserRole(adminUserId: string, targetUserId: string, role: UserRole) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundError('User not found');

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: { id: true, email: true, role: true, status: true },
    });

    await auditService.record({
      actorId: adminUserId,
      action: 'USER_ROLE_UPDATED',
      entityType: 'User',
      entityId: targetUserId,
      details: { previousRole: user.role, newRole: role },
    });

    return updated;
  }

  async verifyAlumniOrMentor(adminUserId: string, type: 'alumni' | 'mentor', profileId: string, isVerified = true) {
    let updated;
    if (type === 'alumni') {
      const profile = await prisma.alumniProfile.findUnique({ where: { id: profileId } });
      if (!profile) throw new NotFoundError('Alumni profile not found');

      updated = await prisma.alumniProfile.update({
        where: { id: profileId },
        data: { isVerified },
      });
    } else {
      const profile = await prisma.mentorProfile.findUnique({ where: { id: profileId } });
      if (!profile) throw new NotFoundError('Mentor profile not found');

      updated = await prisma.mentorProfile.update({
        where: { id: profileId },
        data: { isVerified },
      });
    }

    await auditService.record({
      actorId: adminUserId,
      action: `VERIFIED_${type.toUpperCase()}`,
      entityType: type === 'alumni' ? 'AlumniProfile' : 'MentorProfile',
      entityId: profileId,
      details: { isVerified },
    });

    return updated;
  }

  async getSystemConfig(key: string) {
    const config = await prisma.systemConfig.findUnique({ where: { key } });
    if (!config) throw new NotFoundError(`Config key '${key}' not found`);
    return config;
  }

  async updateSystemConfig(adminUserId: string, key: string, value: any, description?: string) {
    const updated = await prisma.systemConfig.upsert({
      where: { key },
      update: {
        value,
        ...(description && { description }),
      },
      create: {
        key,
        value,
        description,
      },
    });

    await auditService.record({
      actorId: adminUserId,
      action: 'SYSTEM_CONFIG_UPDATED',
      entityType: 'SystemConfig',
      entityId: key,
      details: { value },
    });

    return updated;
  }

  async hidePost(adminUserId: string, postId: string, isHidden: boolean) {
    const post = await prisma.feedPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError('Post not found');

    const updated = await prisma.feedPost.update({
      where: { id: postId },
      data: { isHidden },
    });

    await auditService.record({
      actorId: adminUserId,
      action: isHidden ? 'POST_HIDDEN' : 'POST_UNHIDDEN',
      entityType: 'FeedPost',
      entityId: postId,
    });

    return updated;
  }
}

export const adminService = new AdminService();
