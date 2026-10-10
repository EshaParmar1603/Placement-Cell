import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum([UserRole.STUDENT, UserRole.ALUMNI, UserRole.MENTOR]),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  // Student specifics
  enrollmentNumber: z.string().optional(),
  department: z.string().optional(),
  course: z.string().optional(),
  graduationYear: z.number().int().optional(),
  cgpa: z.number().min(0).max(10).optional(),
  // Alumni specifics
  currentCompany: z.string().optional(),
  currentRole: z.string().optional(),
  // Mentor specifics
  expertise: z.array(z.string()).optional(),
  yearsExperience: z.number().int().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});
