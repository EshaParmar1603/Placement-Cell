import { Request, Response, NextFunction } from 'express';
import { mentorService } from '../services/mentor.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import { getParam } from '../utils/params.js';

export class MentorController {
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await mentorService.updateProfile(req.user!.id, req.body);
      return sendSuccess(res, updated, 'Mentor profile updated');
    } catch (error) {
      next(error);
    }
  }

  async listMentors(req: Request, res: Response, next: NextFunction) {
    try {
      const { expertise, company, page, limit } = req.query as any;
      const result = await mentorService.listMentors({
        expertise,
        company,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      });
      return sendSuccess(res, result.mentors, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getMentorById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const mentor = await mentorService.getMentorById(id);
      return sendSuccess(res, mentor);
    } catch (error) {
      next(error);
    }
  }

  async createSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { slots } = req.body;
      const created = await mentorService.createSlots(req.user!.id, slots);
      return sendCreated(res, created, 'Availability slots created');
    } catch (error) {
      next(error);
    }
  }

  async bookSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const { slotId, resumeId, consentGranted, studentNotes } = req.body;
      const booking = await mentorService.bookSlot(
        req.user!.id,
        slotId,
        resumeId,
        consentGranted,
        studentNotes
      );
      return sendCreated(res, booking, 'Mentor mock interview booked successfully');
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const { reason } = req.body;
      const updated = await mentorService.cancelBooking(id, req.user!.id, reason || 'No reason specified');
      return sendSuccess(res, updated, 'Booking cancelled');
    } catch (error) {
      next(error);
    }
  }

  async submitFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const updated = await mentorService.submitFeedback(req.user!.id, id, req.body);
      return sendSuccess(res, updated, 'Interview feedback submitted');
    } catch (error) {
      next(error);
    }
  }

  async getMyBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const bookings = await mentorService.getMyBookings(req.user!.id, req.user!.role);
      return sendSuccess(res, bookings);
    } catch (error) {
      next(error);
    }
  }
}

export const mentorController = new MentorController();
