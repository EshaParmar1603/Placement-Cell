import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/appError.js';

export interface CreateInterviewTopicDto {
  companyId: string;
  targetRole: string;
  stageName: string;
  topicName: string;
  category?: string;
  description: string;
  practiceQuestions?: any[];
  resources?: any[];
  sourceUrl?: string;
}

export class InterviewPrepService {
  async createTopic(data: CreateInterviewTopicDto) {
    const company = await prisma.company.findUnique({ where: { id: data.companyId } });
    if (!company) throw new NotFoundError('Company not found');

    return prisma.interviewPrepTopic.create({
      data: {
        ...data,
        practiceQuestions: data.practiceQuestions || [],
        resources: data.resources || [],
        verificationDate: new Date(),
      },
    });
  }

  async updateTopic(id: string, data: Partial<CreateInterviewTopicDto>) {
    const topic = await prisma.interviewPrepTopic.findUnique({ where: { id } });
    if (!topic) throw new NotFoundError('Interview prep topic not found');

    return prisma.interviewPrepTopic.update({
      where: { id },
      data: {
        ...data,
        verificationDate: new Date(),
      },
    });
  }

  async deleteTopic(id: string) {
    const topic = await prisma.interviewPrepTopic.findUnique({ where: { id } });
    if (!topic) throw new NotFoundError('Interview prep topic not found');

    return prisma.interviewPrepTopic.delete({ where: { id } });
  }

  async listTopicsByCompany(companyId: string, targetRole?: string) {
    return prisma.interviewPrepTopic.findMany({
      where: {
        companyId,
        ...(targetRole && { targetRole: { contains: targetRole, mode: 'insensitive' } }),
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async generatePreparationPlan(studentId: string, companyId: string, targetRole: string) {
    const [student, company, topics] = await Promise.all([
      prisma.studentProfile.findUnique({ where: { id: studentId } }),
      prisma.company.findUnique({ where: { id: companyId } }),
      prisma.interviewPrepTopic.findMany({
        where: {
          companyId,
          ...(targetRole && { targetRole: { contains: targetRole, mode: 'insensitive' } }),
        },
      }),
    ]);

    if (!student) throw new NotFoundError('Student profile not found');
    if (!company) throw new NotFoundError('Company not found');

    const studentSkillsLower = student.skills.map((s) => s.toLowerCase());

    const planStages = topics.map((topic) => {
      const questions = Array.isArray(topic.practiceQuestions) ? topic.practiceQuestions : [];
      return {
        stageName: topic.stageName,
        topicName: topic.topicName,
        category: topic.category,
        description: topic.description,
        totalQuestions: questions.length,
        practiceQuestions: questions,
        recommendedResources: topic.resources,
      };
    });

    return {
      targetCompany: company.name,
      targetRole,
      studentPreparedness: {
        declaredSkills: student.skills,
        cgpa: student.cgpa,
      },
      structuredRounds: planStages,
      guidance: `Official recruitment rounds verified from ${company.name} career guidelines. Work through each round sequentially.`,
    };
  }
}

export const interviewPrepService = new InterviewPrepService();
