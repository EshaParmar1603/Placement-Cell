import { prisma } from '../config/database.js';
import { OpportunityStatus, Prisma, UserRole } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../utils/appError.js';
import { notificationService } from './notification.service.js';

export interface CreateOpportunityDto {
  companyId: string;
  title: string;
  description: string;
  employmentType?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  stipend?: number;
  deadline: string; // ISO date
  minCgpa?: number;
  allowedDepartments?: string[];
  allowedGraduationYears?: number[];
  maxBacklogsAllowed?: number;
  requiredSkills?: string[];
  preferredSkills?: string[];
}

export class OpportunityService {
  async createOpportunity(managerUserId: string, data: CreateOpportunityDto) {
    const deadlineDate = new Date(data.deadline);
    if (deadlineDate <= new Date()) {
      throw new BadRequestError('Application deadline must be a future date');
    }

    const company = await prisma.company.findUnique({ where: { id: data.companyId } });
    if (!company) throw new NotFoundError('Company not found');

    return prisma.opportunity.create({
      data: {
        ...data,
        deadline: deadlineDate,
        status: OpportunityStatus.DRAFT,
        createdById: managerUserId,
      },
    });
  }

  async updateOpportunity(id: string, data: Partial<CreateOpportunityDto>) {
    const opp = await prisma.opportunity.findUnique({ where: { id } });
    if (!opp) throw new NotFoundError('Opportunity not found');

    const updateData: any = { ...data };
    if (data.deadline) {
      updateData.deadline = new Date(data.deadline);
    }

    return prisma.opportunity.update({
      where: { id },
      data: updateData,
    });
  }

  async publishOpportunity(id: string) {
    const opp = await prisma.opportunity.findUnique({ where: { id } });
    if (!opp) throw new NotFoundError('Opportunity not found');

    if (opp.deadline <= new Date()) {
      throw new BadRequestError('Cannot publish an opportunity with an expired deadline');
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: { status: OpportunityStatus.PUBLISHED },
    });

    // Send notifications to eligible students asynchronously
    notificationService.notifyEligibleStudentsForOpportunity(id).catch(console.error);

    return updated;
  }

  async closeOpportunity(id: string) {
    const opp = await prisma.opportunity.findUnique({ where: { id } });
    if (!opp) throw new NotFoundError('Opportunity not found');

    return prisma.opportunity.update({
      where: { id },
      data: { status: OpportunityStatus.CLOSED },
    });
  }

  async listOpportunities(params: {
    status?: OpportunityStatus;
    search?: string;
    department?: string;
    employmentType?: string;
    page?: number;
    limit?: number;
    userRole?: UserRole;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    // Students can only see published opportunities
    const statusFilter =
      params.userRole === UserRole.STUDENT
        ? OpportunityStatus.PUBLISHED
        : params.status;

    const where: Prisma.OpportunityWhereInput = {
      ...(statusFilter && { status: statusFilter }),
      ...(params.employmentType && { employmentType: params.employmentType }),
      ...(params.department && {
        allowedDepartments: { has: params.department },
      }),
      ...(params.search && {
        OR: [
          { title: { contains: params.search, mode: 'insensitive' } },
          { company: { name: { contains: params.search, mode: 'insensitive' } } },
          { requiredSkills: { hasSome: [params.search] } },
        ],
      }),
    };

    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ status: 'asc' }, { deadline: 'asc' }],
        include: {
          company: { select: { id: true, name: true, logoUrl: true, industry: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.opportunity.count({ where }),
    ]);

    return {
      opportunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOpportunityById(id: string) {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        company: true,
        _count: { select: { applications: true } },
      },
    });

    if (!opportunity) throw new NotFoundError('Opportunity not found');
    return opportunity;
  }

  async getOpportunityApplicants(opportunityId: string) {
    const opp = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });
    if (!opp) throw new NotFoundError('Opportunity not found');

    const applications = await prisma.application.findMany({
      where: { opportunityId },
      include: {
        student: true,
        resume: {
          select: { id: true, version: true, fileName: true, originalName: true, processingStatus: true },
        },
        history: { orderBy: { createdAt: 'desc' } },
      },
    });

    // Categorize into ELIGIBLE, INELIGIBLE, and UNKNOWN
    const categorized = {
      eligible: [] as any[],
      ineligible: [] as any[],
      unknown: [] as any[],
    };

    for (const app of applications) {
      const student = app.student;
      let isUnknown = false;
      let isEligible = true;

      // 1. CGPA check
      if (student.cgpa === null || student.cgpa === undefined || student.cgpa === 0) {
        isUnknown = true;
      } else if (student.cgpa < opp.minCgpa) {
        isEligible = false;
      }

      // 2. Backlogs check
      if (student.activeBacklogs > opp.maxBacklogsAllowed) {
        isEligible = false;
      }

      // 3. Department check
      if (opp.allowedDepartments.length > 0 && !opp.allowedDepartments.includes(student.department)) {
        isEligible = false;
      }

      // 4. Batch year check
      if (opp.allowedGraduationYears.length > 0 && !opp.allowedGraduationYears.includes(student.graduationYear)) {
        isEligible = false;
      }

      if (isUnknown) {
        categorized.unknown.push(app);
      } else if (isEligible) {
        categorized.eligible.push(app);
      } else {
        categorized.ineligible.push(app);
      }
    }

    return {
      opportunity: { id: opp.id, title: opp.title, status: opp.status },
      totalApplicants: applications.length,
      categorized,
    };
  }
}

export const opportunityService = new OpportunityService();
