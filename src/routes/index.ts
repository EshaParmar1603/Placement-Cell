import { Router } from 'express';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';
import resumeRoutes from './resume.routes.js';
import companyRoutes from './company.routes.js';
import opportunityRoutes from './opportunity.routes.js';
import jobMatchingRoutes from './jobMatching.routes.js';
import applicationRoutes from './application.routes.js';
import interviewPrepRoutes from './interviewPrep.routes.js';
import mockInterviewRoutes from './mockInterview.routes.js';
import mentorRoutes from './mentor.routes.js';
import feedRoutes from './feed.routes.js';
import notificationRoutes from './notification.routes.js';
import analyticsRoutes from './analytics.routes.js';
import adminRoutes from './admin.routes.js';
import healthRoutes from './health.routes.js';
import calendarRoutes from './calendar.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/resumes', resumeRoutes);
router.use('/companies', companyRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/job-matches', jobMatchingRoutes);
router.use('/applications', applicationRoutes);
router.use('/interview-preparation', interviewPrepRoutes);
router.use('/mock-interviews', mockInterviewRoutes);
router.use('/mentors', mentorRoutes);
router.use('/feed', feedRoutes);
router.use('/notifications', notificationRoutes);
router.use('/calendar', calendarRoutes);
router.use('/manager/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/health', healthRoutes);

export default router;
