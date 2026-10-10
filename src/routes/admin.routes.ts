import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRoles(UserRole.ADMIN));

router.get('/users', adminController.listUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/verify/:type/:profileId', adminController.verifyProfile);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/config/:key', adminController.getSystemConfig);
router.post('/config/:key', adminController.updateSystemConfig);
router.patch('/posts/:id/visibility', adminController.hidePost);

export default router;
