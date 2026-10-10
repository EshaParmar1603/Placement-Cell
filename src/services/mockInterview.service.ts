import { prisma } from '../config/database.js';
import { getAiService } from './ai/ai.factory.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/appError.js';
import { NotificationType, UserRole } from '@prisma/client';
import { notificationService } from './notification.service.js';

export class MockInterviewService {
  async startSession(studentUserId: string, companyName: string, targetRole: string, resumeId?: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) throw new NotFoundError('Student profile not found');

    let resume = null;
    if (resumeId) {
      resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    } else {
      resume = await prisma.resume.findFirst({
        where: { studentId: student.id },
        orderBy: { version: 'desc' },
      });
    }

    const ai = getAiService();
    const skills = student.skills.length > 0 ? student.skills : ['Problem Solving', 'Data Structures'];
    const summary = (resume?.parsedData as any)?.summary || `Student at ${student.department} with CGPA ${student.cgpa}`;

    // Generate questions
    const generated = await ai.generateMockInterviewQuestions(companyName, targetRole, summary, skills, 4);

    const session = await prisma.mockInterviewSession.create({
      data: {
        studentId: student.id,
        companyName,
        targetRole,
        resumeId: resume?.id || null,
        status: 'IN_PROGRESS',
        questions: {
          create: generated.questions.map((q) => ({
            questionNumber: q.questionNumber,
            category: q.category,
            questionText: q.questionText,
          })),
        },
      },
      include: { questions: { orderBy: { questionNumber: 'asc' } } },
    });

    return session;
  }

  async getSession(sessionId: string, studentUserId: string, role: UserRole) {
    const session = await prisma.mockInterviewSession.findUnique({
      where: { id: sessionId },
      include: {
        student: true,
        resume: { select: { id: true, version: true, originalName: true } },
        questions: { orderBy: { questionNumber: 'asc' } },
      },
    });

    if (!session) throw new NotFoundError('Mock interview session not found');

    if (role === UserRole.STUDENT && session.student.userId !== studentUserId) {
      throw new ForbiddenError('Unauthorized access to interview session');
    }

    return session;
  }

  async submitAnswer(
    sessionId: string,
    questionNumber: number,
    studentAnswer: string,
    studentUserId: string
  ) {
    const session = await prisma.mockInterviewSession.findUnique({
      where: { id: sessionId },
      include: {
        student: true,
        questions: { where: { questionNumber } },
      },
    });

    if (!session || session.student.userId !== studentUserId) {
      throw new NotFoundError('Session or question not found');
    }

    const question = session.questions[0];
    if (!question) throw new NotFoundError('Question not found');

    const ai = getAiService();
    const evaluation = await ai.evaluateInterviewAnswer(
      question.questionText,
      question.category,
      studentAnswer,
      session.targetRole
    );

    const updatedQuestion = await prisma.mockInterviewQuestion.update({
      where: { id: question.id },
      data: {
        studentAnswer,
        score: evaluation.score,
        feedback: JSON.stringify({
          generalFeedback: evaluation.feedback,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          modelAnswerOutline: evaluation.modelAnswerOutline,
          technicalScore: evaluation.technicalScore,
          problemSolvingScore: evaluation.problemSolvingScore,
          communicationScore: evaluation.communicationScore,
        }),
      },
    });

    return {
      questionNumber,
      score: evaluation.score,
      evaluation,
    };
  }

  async completeSession(sessionId: string, studentUserId: string) {
    const session = await prisma.mockInterviewSession.findUnique({
      where: { id: sessionId },
      include: {
        student: true,
        questions: true,
      },
    });

    if (!session || session.student.userId !== studentUserId) {
      throw new NotFoundError('Session not found');
    }

    const answeredQuestions = session.questions.filter((q) => q.score !== null);
    if (answeredQuestions.length === 0) {
      throw new BadRequestError('Cannot complete interview without answering any questions');
    }

    const totalScore = answeredQuestions.reduce((acc, q) => acc + (q.score || 0), 0);
    const overallScore = Math.round((totalScore / (answeredQuestions.length * 10)) * 100);

    const rubrics = {
      technicalCompetency: Math.min(overallScore + 2, 100),
      communicationClarity: Math.max(overallScore - 5, 40),
      problemSolving: overallScore,
      questionsAnswered: answeredQuestions.length,
      totalQuestions: session.questions.length,
    };

    const feedback = {
      summary: `You achieved an overall score of ${overallScore}% for ${session.targetRole} role at ${session.companyName}.`,
      strengths: [
        'Structured responses with clear communication of reasoning',
        'Effective articulation of core concepts',
      ],
      improvementAreas: [
        'Provide deeper mathematical or quantitative justifications',
        'Cover trade-offs and edge-case testing',
      ],
      disclaimer: 'Indicative AI mock interview evaluation for learning and preparation purposes only.',
    };

    const completed = await prisma.mockInterviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        overallScore,
        rubrics,
        feedback,
        completedAt: new Date(),
      },
      include: { questions: { orderBy: { questionNumber: 'asc' } } },
    });

    // Send in-app notification
    await notificationService.create({
      userId: studentUserId,
      type: NotificationType.MOCK_INTERVIEW_COMPLETED,
      title: `Mock Interview Evaluated (${session.companyName})`,
      message: `Your mock interview for ${session.targetRole} at ${session.companyName} is completed. Overall Score: ${overallScore}%.`,
      data: { sessionId },
    });

    return completed;
  }

  async getStudentSessionHistory(studentUserId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId: studentUserId } });
    if (!student) throw new NotFoundError('Student not found');

    return prisma.mockInterviewSession.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      include: {
        questions: { select: { id: true, questionNumber: true, category: true, score: true } },
      },
    });
  }
}

export const mockInterviewService = new MockInterviewService();
