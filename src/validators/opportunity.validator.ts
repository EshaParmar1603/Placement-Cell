import { z } from 'zod';

export const createOpportunitySchema = z.object({
  companyId: z.string().uuid(),
  title: z.string().min(2),
  description: z.string().min(10),
  employmentType: z.string().default('FULL_TIME'),
  location: z.string().default('On-site'),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  stipend: z.number().positive().optional(),
  deadline: z.string().datetime({ offset: true }).or(z.string().min(10)), // accepts ISO string
  minCgpa: z.number().min(0).max(10).default(0),
  allowedDepartments: z.array(z.string()).default([]),
  allowedGraduationYears: z.array(z.number().int()).default([]),
  maxBacklogsAllowed: z.number().int().min(0).default(0),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();
