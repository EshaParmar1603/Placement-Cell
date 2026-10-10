import { Router } from 'express';
import { companyController } from '../controllers/company.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', companyController.listCompanies);
router.get('/:id', companyController.getCompanyById);
router.post(
  '/',
  requireRoles(UserRole.PLACEMENT_MANAGER, UserRole.ADMIN),
  companyController.createCompany
);
router.patch(
  '/:id',
  requireRoles(UserRole.PLACEMENT_MANAGER, UserRole.ADMIN),
  companyController.updateCompany
);

export default router;
