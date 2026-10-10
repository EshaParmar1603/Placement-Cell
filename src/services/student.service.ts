import { prisma } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/appError.js';
import { PlacementStatus, Prisma, UserRole } from '@prisma/client';

export interface UpdateStudentProfileDto {
  fullName?: string;
  phone?: string;
  department?: string;
  course?: string;
  graduationYear?: number;
  cgpa?: number;
  percentage?: number;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  activeBacklogs?: number;
  historyOfBacklogs?: number;
  skills?: string[];
  projects?: any[];
  certifications?: any[];
  achievements?: any[];
  workExperience?: any[];
  targetRoles?: string[];
  preferredLocations?: string[];
  placementStatus?: PlacementStatus;
}

export class StudentService {
  calculateProfileCompletion(profile: any, hasResume: boolean): number {
    let score = 0;
    // 1. Basic Info (20)
    if (profile.fullName && profile.phone && profile.enrollmentNumber) score += 20;
    else if (profile.fullName) score += 10;

    // 2. Academic Info (20)
    if (profile.department && profile.graduationYear && profile.cgpa > 0) score += 20;

    // 3. Skills (20)
    if (profile.skills && profile.skills.length >= 3) score += 20;
    else if (profile.skills && profile.skills.length > 0) score += 10;

    // 4. Projects or Experience (20)
    const projects = Array.isArray(profile.projects) ? profile.projects : [];
    if (projects.length >= 1) score += 20;

    // 5. Resume Uploaded (20)
    if (hasResume) score += 20;

    return Math.min(score, 100);
  }

  async getMyProfile(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        resumes: {
          orderBy: { version: 'desc' },
          select: {
            id: true,
            version: true,
            fileName: true,
            originalName: true,
            fileSize: true,
            processingStatus: true,
            createdAt: true,
          },
        },
        applications: {
          include: {
            opportunity: {
              include: { company: { select: { name: true, logoUrl: true } } },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundError('Student profile not found');
    }

    return profile;
  }

  async getProfileById(id: string, requestingUserRole: UserRole, requestingUserId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, status: true } },
        resumes: requestingUserRole === UserRole.PLACEMENT_MANAGER || requestingUserRole === UserRole.ADMIN
          ? { orderBy: { version: 'desc' } }
          : false,
      },
    });

    if (!profile) {
      throw new NotFoundError('Student profile not found');
    }

    // Confidentiality protection: another student cannot view private resume or unconsented data
    if (requestingUserRole === UserRole.STUDENT && profile.userId !== requestingUserId) {
      // Return public student directory view
      return {
        id: profile.id,
        fullName: profile.fullName,
        department: profile.department,
        course: profile.course,
        graduationYear: profile.graduationYear,
        skills: profile.skills,
        placementStatus: profile.placementStatus,
      };
    }

    return profile;
  }

  async updateMyProfile(userId: string, data: UpdateStudentProfileDto) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { resumes: { select: { id: true } } },
    });

    if (!profile) {
      throw new NotFoundError('Student profile not found');
    }

    const updatedData: any = { ...data };
    const hasResume = profile.resumes.length > 0;
    const mergedForCalc = { ...profile, ...updatedData };
    updatedData.profileCompletion = this.calculateProfileCompletion(mergedForCalc, hasResume);

    return prisma.studentProfile.update({
      where: { id: profile.id },
      data: updatedData,
    });
  }

  async listStudents(params: {
    page?: number;
    limit?: number;
    department?: string;
    graduationYear?: number;
    placementStatus?: PlacementStatus;
    search?: string;
    minCgpa?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentProfileWhereInput = {
      ...(params.department && { department: params.department }),
      ...(params.graduationYear && { graduationYear: params.graduationYear }),
      ...(params.placementStatus && { placementStatus: params.placementStatus }),
      ...(params.minCgpa !== undefined && { cgpa: { gte: params.minCgpa } }),
      ...(params.search && {
        OR: [
          { fullName: { contains: params.search, mode: 'insensitive' } },
          { enrollmentNumber: { contains: params.search, mode: 'insensitive' } },
          { skills: { hasSome: [params.search] } },
        ],
      }),
    };

    const [students, total] = await Promise.all([
      prisma.studentProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ graduationYear: 'desc' }, { cgpa: 'desc' }],
        select: {
          id: true,
          fullName: true,
          enrollmentNumber: true,
          department: true,
          course: true,
          graduationYear: true,
          cgpa: true,
          skills: true,
          placementStatus: true,
          profileCompletion: true,
          resumes: {
            select: {
              id: true,
              version: true,
              originalName: true,
              fileName: true,
              fileSize: true,
              extractedText: true,
              parsedData: true,
              createdAt: true,
              analyses: {
                select: {
                  qualityScore: true,
                  summary: true,
                  strengths: true,
                  weaknesses: true,
                  recommendations: true,
                },
                take: 1,
                orderBy: { createdAt: 'desc' },
              },
            },
            take: 1,
            orderBy: { version: 'desc' },
          },
        },
      }),
      prisma.studentProfile.count({ where }),
    ]);

    return {
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const studentService = new StudentService();
