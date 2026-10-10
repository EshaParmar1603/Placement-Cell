import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRoles(UserRole.PLACEMENT_MANAGER, UserRole.ADMIN));

router.get('/overview', analyticsController.getOverview);
router.get('/demographics', analyticsController.getDemographics);
router.get('/funnel', analyticsController.getFunnel);
router.get('/opportunities/:opportunityId/eligibility', analyticsController.getEligibilityAndNonApplicants);

export default router;
