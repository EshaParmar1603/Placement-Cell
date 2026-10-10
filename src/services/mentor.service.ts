import { prisma } from '../config/database.js';
import { BookingStatus, NotificationType, UserRole } from '@prisma/client';
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '../utils/appError.js';
import { notificationService } from './notification.service.js';

export interface UpdateMentorProfileDto {
  fullName?: string;
  phone?: string;
  currentCompany?: string;
  currentRole?: string;
  yearsExperience?: number;
  expertise?: string[];
  bio?: string;
  maxSessionsPerWeek?: number;
}

export interface CreateSlotDto {
  slotDate: string; // ISO date
  startTime: string; // e.g., "18:00"
  endTime: string;   // e.g., "19:00"
}

export class MentorService {
  async updateProfile(mentorUserId: string, data: UpdateMentorProfileDto) {
    const profile = await prisma.mentorProfile.findUnique({
      where: { userId: mentorUserId },
    });
    if (!profile) throw new NotFoundError('Mentor profile not found');

    return prisma.mentorProfile.update({
      where: { id: profile.id },
      data,
    });
  }

  async listMentors(params: { expertise?: string; company?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.company) {
      where.currentCompany = { contains: params.company, mode: 'insensitive' };
    }
    if (params.expertise) {
      where.expertise = { has: params.expertise };
    }

    const [mentors, total] = await Promise.all([
      prisma.mentorProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { yearsExperience: 'desc' },
        include: {
          slots: {
            where: { isBooked: false, slotDate: { gte: new Date() } },
            orderBy: [{ slotDate: 'asc' }, { startTime: 'asc' }],
          },
        },
      }),
      prisma.mentorProfile.count({ where }),
    ]);

    return {
      mentors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMentorById(mentorId: string) {
    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorId },
      include: {
        slots: {
          where: { slotDate: { gte: new Date() } },
          orderBy: [{ slotDate: 'asc' }, { startTime: 'asc' }],
        },
      },
    });

    if (!mentor) throw new NotFoundError('Mentor not found');
    return mentor;
  }

  async createSlots(mentorUserId: string, slotsData: CreateSlotDto[]) {
    const mentor = await prisma.mentorProfile.findUnique({
      where: { userId: mentorUserId },
    });
    if (!mentor) throw new NotFoundError('Mentor profile not found');

    const createdSlots = [];
    for (const s of slotsData) {
      const slotDate = new Date(s.slotDate);
      slotDate.setHours(0, 0, 0, 0);

      const slot = await prisma.mentorSlot.create({
        data: {
          mentorId: mentor.id,
          slotDate,
          startTime: s.startTime,
          endTime: s.endTime,
          isBooked: false,
        },
      });
      createdSlots.push(slot);
    }

    return createdSlots;
  }

  async bookSlot(
    studentUserId: string,
    slotId: string,
    resumeId?: string,
    consentGranted = true,
    studentNotes?: string
  ) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) throw new NotFoundError('Student profile not found');

    if (resumeId) {
      const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
      if (!resume || resume.studentId !== student.id) {
        throw new BadRequestError('Invalid resume chosen');
      }
    }

    // Double-booking prevention via transactional concurrency lock
    const booking = await prisma.$transaction(async (tx) => {
      // Find slot
      const slot = await tx.mentorSlot.findUnique({
        where: { id: slotId },
        include: { mentor: { include: { user: true } } },
      });

      if (!slot) {
        throw new NotFoundError('Availability slot not found');
      }

      if (slot.isBooked) {
        throw new ConflictError('This mentor time slot is already booked');
      }

      // Mark slot as booked
      await tx.mentorSlot.update({
        where: { id: slotId },
        data: { isBooked: true },
      });

      // Create booking
      const newBooking = await tx.mentorBooking.create({
        data: {
          studentId: student.id,
          mentorId: slot.mentorId,
          slotId: slot.id,
          resumeId: resumeId || null,
          consentGranted,
          status: BookingStatus.CONFIRMED,
          studentNotes,
          meetingUrl: 'https://meet.google.com/placewise-mock-' + Math.random().toString(36).substring(7),
        },
        include: { mentor: true, slot: true },
      });

      return { newBooking, mentorUserId: slot.mentor.userId };
    });

    // Notify mentor
    await notificationService.create({
      userId: booking.mentorUserId,
      type: NotificationType.MENTOR_BOOKING_REQUESTED,
      title: 'New Mock Interview Session Booked',
      message: `${student.fullName} has booked an interview slot with you for ${booking.newBooking.slot.slotDate.toLocaleDateString()} at ${booking.newBooking.slot.startTime}.`,
      data: { bookingId: booking.newBooking.id },
      sendEmailNotification: true,
    });

    return booking.newBooking;
  }

  async cancelBooking(bookingId: string, userId: string, reason: string) {
    const booking = await prisma.mentorBooking.findUnique({
      where: { id: bookingId },
      include: {
        student: { select: { userId: true } },
        mentor: { select: { userId: true } },
        slot: true,
      },
    });

    if (!booking) throw new NotFoundError('Booking not found');

    if (booking.student.userId !== userId && booking.mentor.userId !== userId) {
      throw new ForbiddenError('Unauthorized to cancel this booking');
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Free up slot
      await tx.mentorSlot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });

      return tx.mentorBooking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELLED,
          cancellationReason: reason,
        },
      });
    });

    const notifyTarget = booking.student.userId === userId ? booking.mentor.userId : booking.student.userId;
    await notificationService.create({
      userId: notifyTarget,
      type: NotificationType.MENTOR_BOOKING_CANCELLED,
      title: 'Mentor Session Cancelled',
      message: `The scheduled interview session has been cancelled. Reason: ${reason}`,
      data: { bookingId },
    });

    return updated;
  }

  async submitFeedback(
    mentorUserId: string,
    bookingId: string,
    feedback: {
      technicalRating: number;
      communicationRating: number;
      problemSolvingRating: number;
      overallRating: number;
      summaryComments: string;
      recommendation: string;
    }
  ) {
    const mentor = await prisma.mentorProfile.findUnique({ where: { userId: mentorUserId } });
    if (!mentor) throw new NotFoundError('Mentor profile not found');

    const booking = await prisma.mentorBooking.findUnique({
      where: { id: bookingId },
      include: { student: true },
    });

    if (!booking || booking.mentorId !== mentor.id) {
      throw new NotFoundError('Booking not found or not assigned to you');
    }

    const updated = await prisma.mentorBooking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.COMPLETED,
        rating: feedback.overallRating,
        feedback: feedback as any,
      },
    });

    // Notify student that feedback is available
    await notificationService.create({
      userId: booking.student.userId,
      type: NotificationType.SYSTEM,
      title: 'Mentor Interview Feedback Available',
      message: `${mentor.fullName} has submitted structured feedback for your mock interview.`,
      data: { bookingId },
      sendEmailNotification: true,
    });

    return updated;
  }

  async getMyBookings(userId: string, role: UserRole) {
    if (role === UserRole.STUDENT) {
      const student = await prisma.studentProfile.findUnique({ where: { userId } });
      if (!student) throw new NotFoundError('Student profile not found');

      return prisma.mentorBooking.findMany({
        where: { studentId: student.id },
        include: {
          mentor: true,
          slot: true,
          resume: { select: { id: true, version: true, originalName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === UserRole.MENTOR) {
      const mentor = await prisma.mentorProfile.findUnique({ where: { userId } });
      if (!mentor) throw new NotFoundError('Mentor profile not found');

      return prisma.mentorBooking.findMany({
        where: { mentorId: mentor.id },
        include: {
          student: true,
          slot: true,
          resume: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    throw new BadRequestError('Invalid role for bookings retrieval');
  }
}

export const mentorService = new MentorService();
