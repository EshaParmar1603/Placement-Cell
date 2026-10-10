import { Router } from 'express';
import { mockInterviewController } from '../controllers/mockInterview.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import {
  startMockInterviewSchema,
  submitAnswerSchema,
} from '../validators/mockInterview.validator.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post(
  '/start',
  requireRoles(UserRole.STUDENT),
  validateBody(startMockInterviewSchema),
  mockInterviewController.startSession
);

router.get(
  '/history',
  requireRoles(UserRole.STUDENT),
  mockInterviewController.getHistory
);

router.get(
  '/:id',
  mockInterviewController.getSession
);

router.post(
  '/:id/answer',
  requireRoles(UserRole.STUDENT),
  validateBody(submitAnswerSchema),
  mockInterviewController.submitAnswer
);

router.post(
  '/:id/complete',
  requireRoles(UserRole.STUDENT),
  mockInterviewController.completeSession
);

export default router;
