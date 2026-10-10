import { Router } from 'express';
import { opportunityController } from '../controllers/opportunity.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import {
  createOpportunitySchema,
  updateOpportunitySchema,
} from '../validators/opportunity.validator.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', opportunityController.listOpportunities);
router.get('/:id', opportunityController.getOpportunityById);

router.post(
  '/',
  requireRoles(UserRole.PLACEMENT_MANAGER, UserRole.ADMIN),
  validateBody(createOpportunitySchema),
  opportunityController.createOpportunity
);

router.patch(
  '/:id',
  requireRoles(UserRole.PLACEMENT_MANAGER, UserRole.ADMIN),
  validateBody(updateOpportunitySchema),
  opportunityController.updateOpportunity
);

router.post(
  '/:id/publish',
  requireRoles(UserRole.PLACEMENT_MANAGER, UserRole.ADMIN),
  opportunityController.publishOpportunity
);

router.post(
  '/:id/close',
  requireRoles(UserRole.PLACEMENT_MANAGER, UserRole.ADMIN),
  opportunityController.closeOpportunity
);

router.get(
  '/:id/applicants',
  requireRoles(UserRole.PLACEMENT_MANAGER, UserRole.ADMIN),
  opportunityController.getOpportunityApplicants
);

export default router;
