import { prisma } from '../config/database.js';
import { getAiService } from './ai/ai.factory.js';
import { ParsedResumeData } from './ai/ai.interface.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/appError.js';
import { UserRole } from '@prisma/client';

export class ResumeAnalysisService {
  async analyze(resumeId: string, requestingUserRole: UserRole, requestingUserId: string) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: { student: true },
    });

    if (!resume) throw new NotFoundError('Resume not found');

    if (requestingUserRole === UserRole.STUDENT && resume.student.userId !== requestingUserId) {
      throw new ForbiddenError('You can only analyze your own resumes');
    }

    const ai = getAiService();
    const parsedData: ParsedResumeData = (resume.parsedData as any) || {
      skills: [],
      education: [],
      projects: [],
      experience: [],
      certifications: [],
    };

    const analysisResult = await ai.analyzeResume(parsedData, resume.extractedText || '');

    const savedAnalysis = await prisma.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        qualityScore: analysisResult.qualityScore,
        summary: analysisResult.summary,
        strengths: analysisResult.strengths as any,
        weaknesses: analysisResult.weaknesses as any,
        missingInfo: analysisResult.missingInfo as any,
        recommendations: analysisResult.recommendations as any,
        rawAiResponse: { provider: ai.name, timestamp: new Date().toISOString() },
      },
    });

    return savedAnalysis;
  }

  async getAnalysisHistory(resumeId: string, requestingUserRole: UserRole, requestingUserId: string) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: { student: true },
    });

    if (!resume) throw new NotFoundError('Resume not found');

    if (requestingUserRole === UserRole.STUDENT && resume.student.userId !== requestingUserId) {
      throw new ForbiddenError('Unauthorized access');
    }

    return prisma.resumeAnalysis.findMany({
      where: { resumeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async compareVersions(
    versionIdA: string,
    versionIdB: string,
    requestingUserRole: UserRole,
    requestingUserId: string
  ) {
    const [resumeA, resumeB] = await Promise.all([
      prisma.resume.findUnique({
        where: { id: versionIdA },
        include: { student: true, analyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
      }),
      prisma.resume.findUnique({
        where: { id: versionIdB },
        include: { student: true, analyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
      }),
    ]);

    if (!resumeA || !resumeB) {
      throw new NotFoundError('One or both resume versions not found');
    }

    if (resumeA.studentId !== resumeB.studentId) {
      throw new BadRequestError('Cannot compare resumes belonging to different students');
    }

    if (requestingUserRole === UserRole.STUDENT && resumeA.student.userId !== requestingUserId) {
      throw new ForbiddenError('Unauthorized access');
    }

    const dataA = (resumeA.parsedData as any) || {};
    const dataB = (resumeB.parsedData as any) || {};

    const skillsA = new Set<string>((dataA.skills || []).map((s: string) => s.toLowerCase()));
    const skillsB = new Set<string>((dataB.skills || []).map((s: string) => s.toLowerCase()));

    const addedSkills = [...skillsB].filter((s) => !skillsA.has(s));
    const removedSkills = [...skillsA].filter((s) => !skillsB.has(s));

    const scoreA = resumeA.analyses[0]?.qualityScore || 0;
    const scoreB = resumeB.analyses[0]?.qualityScore || 0;

    return {
      versionA: {
        id: resumeA.id,
        version: resumeA.version,
        score: scoreA,
        totalSkills: skillsA.size,
      },
      versionB: {
        id: resumeB.id,
        version: resumeB.version,
        score: scoreB,
        totalSkills: skillsB.size,
      },
      diff: {
        scoreChange: scoreB - scoreA,
        addedSkills,
        removedSkills,
      },
    };
  }
}

export const resumeAnalysisService = new ResumeAnalysisService();
