import { Router } from 'express';
import { applicationController } from '../controllers/application.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requireRoles(UserRole.STUDENT),
  applicationController.apply
);

router.get(
  '/me',
  requireRoles(UserRole.STUDENT),
  applicationController.getMyApplications
);

router.post(
  '/:id/withdraw',
  requireRoles(UserRole.STUDENT),
  applicationController.withdrawApplication
);

router.patch(
  '/:id/stage',
  requireRoles(UserRole.PLACEMENT_MANAGER, UserRole.ADMIN),
  applicationController.updateStage
);

router.get(
  '/opportunities/:opportunityId/export',
  requireRoles(UserRole.PLACEMENT_MANAGER, UserRole.ADMIN),
  applicationController.exportApplications
);

export default router;
