import { prisma } from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/appError.js';
import { Prisma } from '@prisma/client';

export interface CreateCompanyDto {
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  careersUrl?: string;
  industry?: string;
  description?: string;
  sourceUrl?: string;
}

export class CompanyService {
  async createCompany(data: CreateCompanyDto) {
    const existing = await prisma.company.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new ConflictError(`Company '${data.name}' already exists`);
    }

    return prisma.company.create({
      data: {
        ...data,
        verifiedByManager: true,
        verificationDate: new Date(),
      },
    });
  }

  async updateCompany(id: string, data: Partial<CreateCompanyDto>) {
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundError('Company not found');

    return prisma.company.update({
      where: { id },
      data: {
        ...data,
        verificationDate: new Date(),
      },
    });
  }

  async listCompanies(params: { search?: string; industry?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CompanyWhereInput = {
      ...(params.industry && { industry: params.industry }),
      ...(params.search && {
        name: { contains: params.search, mode: 'insensitive' },
      }),
    };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { opportunities: true, interviewTopics: true },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return {
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCompanyById(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        opportunities: {
          where: { status: 'PUBLISHED' },
          orderBy: { deadline: 'asc' },
        },
        interviewTopics: true,
      },
    });

    if (!company) throw new NotFoundError('Company not found');
    return company;
  }
}

export const companyService = new CompanyService();
