import { Router } from 'express';
import multer from 'multer';
import { resumeController } from '../controllers/resume.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { UserRole } from '@prisma/client';
import { BadRequestError } from '../utils/appError.js';
import { env } from '../config/env.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.pdf') || file.originalname.endsWith('.docx')) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only PDF and DOCX files are allowed'));
    }
  },
});

const router = Router();

router.use(authenticate);

router.post(
  '/upload',
  requireRoles(UserRole.STUDENT),
  upload.single('resume'),
  resumeController.upload
);
router.get('/me', requireRoles(UserRole.STUDENT), resumeController.getMyResumes);
router.get('/compare', requireRoles(UserRole.STUDENT, UserRole.PLACEMENT_MANAGER, UserRole.ADMIN), resumeController.compare);
router.get('/:id', resumeController.getResumeById);
router.get('/:id/download', resumeController.download);
router.post('/:id/analyze', resumeController.analyze);
router.get('/:id/analysis-history', resumeController.getAnalysisHistory);

export default router;
