import { z } from 'zod';

export const startMockInterviewSchema = z.object({
  companyName: z.string().min(2),
  targetRole: z.string().min(2),
  resumeId: z.string().uuid().optional(),
});

export const submitAnswerSchema = z.object({
  questionNumber: z.number().int().min(1),
  studentAnswer: z.string().min(5),
});
