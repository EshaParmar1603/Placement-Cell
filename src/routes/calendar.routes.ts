import { Router } from 'express';
import { calendarController } from '../controllers/calendar.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/events', calendarController.getEvents);
router.post(
  '/events',
  requireRoles(UserRole.PLACEMENT_MANAGER, UserRole.ADMIN),
  calendarController.scheduleEvent
);
router.delete(
  '/events/:id',
  requireRoles(UserRole.PLACEMENT_MANAGER, UserRole.ADMIN),
  calendarController.deleteEvent
);

export default router;
