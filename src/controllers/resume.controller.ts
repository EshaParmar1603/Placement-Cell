import { Request, Response, NextFunction } from 'express';
import { resumeService } from '../services/resume.service.js';
import { resumeAnalysisService } from '../services/resumeAnalysis.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import { BadRequestError } from '../utils/appError.js';
import { getParam } from '../utils/params.js';

export class ResumeController {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('No file uploaded. Please provide a PDF or DOCX resume.');
      }

      const result = await resumeService.uploadAndProcess(req.user!.id, {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      return sendCreated(res, result, 'Resume uploaded and analyzed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyResumes(req: Request, res: Response, next: NextFunction) {
    try {
      const studentProfileId = req.user!.studentProfileId;
      if (!studentProfileId) {
        throw new BadRequestError('User does not have a student profile');
      }

      const resumes = await resumeService.getStudentResumes(studentProfileId, req.user!.role, req.user!.id);
      return sendSuccess(res, resumes);
    } catch (error) {
      next(error);
    }
  }

  async getResumeById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const resume = await resumeService.getResumeById(id, req.user!.role, req.user!.id);
      return sendSuccess(res, resume);
    } catch (error) {
      next(error);
    }
  }

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const fileData = await resumeService.getResumeFile(id, req.user!.role, req.user!.id);
      res.setHeader('Content-Type', fileData.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileData.fileName}"`);
      return res.send(fileData.buffer);
    } catch (error) {
      next(error);
    }
  }

  async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const analysis = await resumeAnalysisService.analyze(id, req.user!.role, req.user!.id);
      return sendSuccess(res, analysis, 'Resume quality evaluation completed');
    } catch (error) {
      next(error);
    }
  }

  async getAnalysisHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const history = await resumeAnalysisService.getAnalysisHistory(id, req.user!.role, req.user!.id);
      return sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }

  async compare(req: Request, res: Response, next: NextFunction) {
    try {
      const { versionA, versionB } = req.query as { versionA: string; versionB: string };
      if (!versionA || !versionB) {
        throw new BadRequestError('Both versionA and versionB query parameters are required for comparison');
      }

      const diff = await resumeAnalysisService.compareVersions(versionA, versionB, req.user!.role, req.user!.id);
      return sendSuccess(res, diff);
    } catch (error) {
      next(error);
    }
  }
}

export const resumeController = new ResumeController();
