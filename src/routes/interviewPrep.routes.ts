import { Router } from 'express';
import { interviewPrepController } from '../controllers/interviewPrep.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/company/:companyId', interviewPrepController.listTopicsByCompany);
router.get('/company/:companyId/plan', requireRoles(UserRole.STUDENT), interviewPrepController.getPreparationPlan);

router.post(
  '/',
  requireRoles(UserRole.PLACEMENT_MANAGER, UserRole.ADMIN),
  interviewPrepController.createTopic
);

router.patch(
  '/:id',
  requireRoles(UserRole.PLACEMENT_MANAGER, UserRole.ADMIN),
  interviewPrepController.updateTopic
);

router.delete(
  '/:id',
  requireRoles(UserRole.PLACEMENT_MANAGER, UserRole.ADMIN),
  interviewPrepController.deleteTopic
);

export default router;
