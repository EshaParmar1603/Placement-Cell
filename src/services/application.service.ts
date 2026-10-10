import { prisma } from '../config/database.js';
import { ApplicationStage, NotificationType, OpportunityStatus, UserRole } from '@prisma/client';
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '../utils/appError.js';
import { notificationService } from './notification.service.js';
import { auditService } from './audit.service.js';

export class ApplicationService {
  async apply(studentUserId: string, opportunityId: string, resumeId: string, notes?: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) throw new NotFoundError('Student profile not found');

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { company: true },
    });
    if (!opportunity) throw new NotFoundError('Opportunity not found');

    // 1. Status and deadline check
    if (opportunity.status !== OpportunityStatus.PUBLISHED) {
      throw new BadRequestError('Applications are only accepted for PUBLISHED opportunities');
    }

    if (new Date() > new Date(opportunity.deadline)) {
      throw new BadRequestError('Application deadline has passed');
    }

    // 2. Validate resume ownership
    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume || resume.studentId !== student.id) {
      throw new BadRequestError('Invalid resume selected. Resume must belong to you.');
    }

    // 3. Prevent duplicate applications
    const existing = await prisma.application.findUnique({
      where: {
        opportunityId_studentId: {
          opportunityId,
          studentId: student.id,
        },
      },
    });

    if (existing) {
      throw new ConflictError('You have already applied to this opportunity');
    }

    // 4. Create application & history inside transaction
    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          opportunityId,
          studentId: student.id,
          resumeId,
          notes,
          currentStage: ApplicationStage.APPLIED,
        },
      });

      await tx.applicationHistory.create({
        data: {
          applicationId: app.id,
          previousStage: ApplicationStage.APPLIED,
          newStage: ApplicationStage.APPLIED,
          changedById: studentUserId,
          remarks: 'Application submitted by student',
        },
      });

      return app;
    });

    // 5. Notify student
    await notificationService.create({
      userId: studentUserId,
      type: NotificationType.APPLICATION_SUBMITTED,
      title: `Application Submitted: ${opportunity.title}`,
      message: `Your application for ${opportunity.title} at ${opportunity.company.name} has been received.`,
      data: { applicationId: application.id, opportunityId },
      sendEmailNotification: true,
    });

    // 6. Notify placement manager if creator exists
    if (opportunity.createdById) {
      await notificationService.create({
        userId: opportunity.createdById,
        type: NotificationType.APPLICATION_RECEIVED,
        title: `New Application Received`,
        message: `${student.fullName} applied for ${opportunity.title} (${opportunity.company.name}).`,
        data: { applicationId: application.id, studentId: student.id },
      });
    }

    return prisma.application.findUnique({
      where: { id: application.id },
      include: { opportunity: true, resume: true },
    });
  }

  async getMyApplications(studentUserId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) throw new NotFoundError('Student profile not found');

    return prisma.application.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      include: {
        opportunity: {
          include: { company: { select: { id: true, name: true, logoUrl: true } } },
        },
        resume: { select: { id: true, version: true, fileName: true, originalName: true } },
        history: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async withdrawApplication(studentUserId: string, applicationId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) throw new NotFoundError('Student profile not found');

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { opportunity: true },
    });

    if (!app || app.studentId !== student.id) {
      throw new NotFoundError('Application not found');
    }

    if (app.currentStage === ApplicationStage.OFFERED || app.currentStage === ApplicationStage.REJECTED) {
      throw new BadRequestError('Cannot withdraw an application that has already concluded');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const prev = app.currentStage;
      const res = await tx.application.update({
        where: { id: applicationId },
        data: { currentStage: ApplicationStage.WITHDRAWN },
      });

      await tx.applicationHistory.create({
        data: {
          applicationId: app.id,
          previousStage: prev,
          newStage: ApplicationStage.WITHDRAWN,
          changedById: studentUserId,
          remarks: 'Withdrawn by student',
        },
      });

      return res;
    });

    return updated;
  }

  async updateStage(
    managerUserId: string,
    applicationId: string,
    newStage: ApplicationStage,
    remarks?: string
  ) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: { include: { user: true } },
        opportunity: { include: { company: true } },
      },
    });

    if (!app) throw new NotFoundError('Application not found');

    const previousStage = app.currentStage;

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.application.update({
        where: { id: applicationId },
        data: { currentStage: newStage },
      });

      await tx.applicationHistory.create({
        data: {
          applicationId,
          previousStage,
          newStage,
          changedById: managerUserId,
          remarks: remarks || `Status transitioned to ${newStage}`,
        },
      });

      return res;
    });

    // Notify student about status change
    await notificationService.create({
      userId: app.student.userId,
      type: NotificationType.APPLICATION_STATUS_CHANGED,
      title: `Application Update: ${app.opportunity.title}`,
      message: `Your application status for ${app.opportunity.title} at ${app.opportunity.company.name} is now: ${newStage.replace('_', ' ')}.`,
      data: { applicationId, newStage },
      sendEmailNotification: true,
    });

    await auditService.record({
      actorId: managerUserId,
      action: 'APPLICATION_STAGE_UPDATED',
      entityType: 'Application',
      entityId: applicationId,
      details: { previousStage, newStage, remarks },
    });

    return updated;
  }

  async exportApplications(opportunityId: string) {
    const applications = await prisma.application.findMany({
      where: { opportunityId },
      include: {
        student: true,
        resume: { select: { version: true, originalName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((a) => ({
      applicationId: a.id,
      studentName: a.student.fullName,
      enrollmentNumber: a.student.enrollmentNumber,
      department: a.student.department,
      graduationYear: a.student.graduationYear,
      cgpa: a.student.cgpa,
      activeBacklogs: a.student.activeBacklogs,
      stage: a.currentStage,
      resumeVersion: a.resume.version,
      appliedAt: a.createdAt.toISOString(),
    }));
  }
}

export const applicationService = new ApplicationService();
