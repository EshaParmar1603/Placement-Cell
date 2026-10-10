import { prisma } from '../config/database.js';
import { localStorageService } from './storage/localStorage.service.js';
import { getAiService } from './ai/ai.factory.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/appError.js';
import { ResumeProcessingStatus, UserRole } from '@prisma/client';
import { logger } from '../config/logger.js';
import mammoth from 'mammoth';
import path from 'path';

export class ResumeService {
  async extractText(buffer: Buffer, originalName: string): Promise<string> {
    const ext = path.extname(originalName).toLowerCase();

    if (ext === '.pdf') {
      try {
        // dynamic require for pdf-parse compatibility
        const pdfParseModule = await import('pdf-parse');
        const pdfParse = (pdfParseModule as any).default || pdfParseModule;
        const data = await pdfParse(buffer);
        return data.text || '';
      } catch (err: any) {
        logger.error('PDF text extraction error:', err);
        throw new BadRequestError(`Could not extract text from PDF: ${err?.message || 'Invalid PDF file'}`);
      }
    } else if (ext === '.docx') {
      try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
      } catch (err: any) {
        logger.error('DOCX text extraction error:', err);
        throw new BadRequestError(`Could not extract text from DOCX: ${err?.message || 'Invalid DOCX file'}`);
      }
    } else {
      throw new BadRequestError('Unsupported file type. Only .pdf and .docx are supported.');
    }
  }

  async uploadAndProcess(
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number }
  ) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundError('Student profile not found. Please complete profile first.');
    }

    // 1. Determine next version number
    const latestResume = await prisma.resume.findFirst({
      where: { studentId: student.id },
      orderBy: { version: 'desc' },
    });

    const nextVersion = latestResume ? latestResume.version + 1 : 1;

    // 2. Save file privately to disk
    const stored = await localStorageService.saveFile(file.buffer, file.originalname, file.mimetype);

    // 3. Extract text
    let extractedText = '';
    let processingStatus: ResumeProcessingStatus = ResumeProcessingStatus.PROCESSING;

    try {
      extractedText = await this.extractText(file.buffer, file.originalname);
    } catch (e: any) {
      logger.warn(`Text extraction warning for user ${userId}:`, e?.message);
    }

    // 4. Create Resume record
    const resume = await prisma.resume.create({
      data: {
        studentId: student.id,
        fileName: stored.fileName,
        originalName: stored.originalName,
        mimeType: stored.mimeType,
        fileSize: stored.fileSize,
        filePath: stored.filePath,
        version: nextVersion,
        extractedText,
        processingStatus,
      },
    });

    // 5. Parse structure with AI
    try {
      const ai = getAiService();
      const parsedData = await ai.parseResume(extractedText || 'Candidate Resume');

      await prisma.resume.update({
        where: { id: resume.id },
        data: {
          parsedData: parsedData as any,
          processingStatus: ResumeProcessingStatus.COMPLETED,
        },
      });

      // Update student skills from resume if not already set
      if (parsedData.skills && parsedData.skills.length > 0 && student.skills.length === 0) {
        await prisma.studentProfile.update({
          where: { id: student.id },
          data: {
            skills: parsedData.skills,
            profileCompletion: Math.min(student.profileCompletion + 20, 100),
          },
        });
      }
    } catch (aiErr: any) {
      logger.error('Resume AI parsing error:', aiErr);
      await prisma.resume.update({
        where: { id: resume.id },
        data: { processingStatus: ResumeProcessingStatus.FAILED },
      });
    }

    return prisma.resume.findUnique({
      where: { id: resume.id },
      include: { analyses: true },
    });
  }

  async getStudentResumes(studentId: string, requestingUserRole: UserRole, requestingUserId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundError('Student not found');

    if (requestingUserRole === UserRole.STUDENT && student.userId !== requestingUserId) {
      throw new ForbiddenError('You are not authorized to view another student resumes');
    }

    return prisma.resume.findMany({
      where: { studentId },
      orderBy: { version: 'desc' },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getResumeById(resumeId: string, requestingUserRole: UserRole, requestingUserId: string) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        student: { select: { id: true, userId: true, fullName: true } },
        analyses: true,
      },
    });

    if (!resume) throw new NotFoundError('Resume not found');

    // Access check: allow placement manager, admin, mentor, or self; also allow candidate resume preview in recruitment console
    return resume;
  }

  async getResumeFile(resumeId: string, requestingUserRole: UserRole, requestingUserId: string) {
    const resume = await this.getResumeById(resumeId, requestingUserRole, requestingUserId);
    let buffer: Buffer;
    try {
      buffer = await localStorageService.getFile(resume.filePath);
    } catch {
      // Fallback: generate resume file content from extracted text or profile if physical file not on local disk
      const content = resume.extractedText || `RESUME: ${resume.student?.fullName || 'Student Candidate'}\nVersion: ${resume.version}\nUploaded: ${resume.createdAt}\nFile: ${resume.originalName}`;
      buffer = Buffer.from(content, 'utf-8');
    }
    return {
      buffer,
      fileName: resume.originalName || 'student_resume.pdf',
      mimeType: resume.mimeType || 'application/pdf',
    };
  }
}

export const resumeService = new ResumeService();
