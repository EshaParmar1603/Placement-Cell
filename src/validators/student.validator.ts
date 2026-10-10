import { z } from 'zod';
import { PlacementStatus } from '@prisma/client';

export const updateStudentProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  course: z.string().optional(),
  graduationYear: z.number().int().optional(),
  cgpa: z.number().min(0).max(10).optional(),
  percentage: z.number().min(0).max(100).optional(),
  tenthPercentage: z.number().min(0).max(100).optional(),
  twelfthPercentage: z.number().min(0).max(100).optional(),
  activeBacklogs: z.number().int().min(0).optional(),
  historyOfBacklogs: z.number().int().min(0).optional(),
  skills: z.array(z.string()).optional(),
  projects: z.array(z.any()).optional(),
  certifications: z.array(z.any()).optional(),
  achievements: z.array(z.any()).optional(),
  workExperience: z.array(z.any()).optional(),
  targetRoles: z.array(z.string()).optional(),
  preferredLocations: z.array(z.string()).optional(),
  placementStatus: z.nativeEnum(PlacementStatus).optional(),
});
