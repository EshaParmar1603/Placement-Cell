import { Router } from 'express';
import { jobMatchingController } from '../controllers/jobMatching.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/opportunities/:opportunityId',
  requireRoles(UserRole.STUDENT),
  jobMatchingController.evaluateMatch
);

export default router;
