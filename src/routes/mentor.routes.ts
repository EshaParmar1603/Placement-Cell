import { Router } from 'express';
import { mentorController } from '../controllers/mentor.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import {
  updateMentorProfileSchema,
  createSlotsSchema,
  bookSlotSchema,
  submitFeedbackSchema,
} from '../validators/mentor.validator.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', mentorController.listMentors);
router.get('/my-bookings', mentorController.getMyBookings);
router.get('/:id', mentorController.getMentorById);

router.patch(
  '/profile',
  requireRoles(UserRole.MENTOR),
  validateBody(updateMentorProfileSchema),
  mentorController.updateProfile
);

router.post(
  '/slots',
  requireRoles(UserRole.MENTOR),
  validateBody(createSlotsSchema),
  mentorController.createSlots
);

router.post(
  '/book',
  requireRoles(UserRole.STUDENT),
  validateBody(bookSlotSchema),
  mentorController.bookSlot
);

router.post(
  '/bookings/:id/cancel',
  mentorController.cancelBooking
);

router.post(
  '/bookings/:id/feedback',
  requireRoles(UserRole.MENTOR),
  validateBody(submitFeedbackSchema),
  mentorController.submitFeedback
);

export default router;
