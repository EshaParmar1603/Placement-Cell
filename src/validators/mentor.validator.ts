import { z } from 'zod';

export const updateMentorProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  currentCompany: z.string().optional(),
  currentRole: z.string().optional(),
  yearsExperience: z.number().int().min(0).optional(),
  expertise: z.array(z.string()).optional(),
  bio: z.string().optional(),
  maxSessionsPerWeek: z.number().int().positive().optional(),
});

export const createSlotsSchema = z.object({
  slots: z.array(
    z.object({
      slotDate: z.string().min(10),
      startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:MM'),
      endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:MM'),
    })
  ).min(1),
});

export const bookSlotSchema = z.object({
  slotId: z.string().uuid(),
  resumeId: z.string().uuid().optional(),
  consentGranted: z.boolean().default(true),
  studentNotes: z.string().optional(),
});

export const submitFeedbackSchema = z.object({
  technicalRating: z.number().min(1).max(10),
  communicationRating: z.number().min(1).max(10),
  problemSolvingRating: z.number().min(1).max(10),
  overallRating: z.number().min(1).max(10),
  summaryComments: z.string().min(5),
  recommendation: z.string().min(2),
});
