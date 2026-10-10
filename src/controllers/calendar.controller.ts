import { Request, Response, NextFunction } from 'express';
import { calendarService } from '../services/calendar.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { getParam } from '../utils/params.js';

export class CalendarController {
  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await calendarService.getAllEvents();
      return sendSuccess(res, events);
    } catch (error) {
      next(error);
    }
  }

  async scheduleEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const newEvent = await calendarService.scheduleEvent(req.body, req.user!.id);
      return sendCreated(res, newEvent, 'Placement date scheduled successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      await calendarService.deleteEvent(id);
      return sendSuccess(res, null, 'Event removed from placement schedule');
    } catch (error) {
      next(error);
    }
  }
}

export const calendarController = new CalendarController();
