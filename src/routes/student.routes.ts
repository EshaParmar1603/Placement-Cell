import { Router } from 'express';
import { studentController } from '../controllers/student.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { updateStudentProfileSchema } from '../validators/student.validator.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/me', requireRoles(UserRole.STUDENT), studentController.getMyProfile);
router.patch(
  '/me',
  requireRoles(UserRole.STUDENT),
  validateBody(updateStudentProfileSchema),
  studentController.updateMyProfile
);
router.get('/', studentController.listStudents);
router.get('/:id', studentController.getProfileById);

export default router;
