import { Request, Response, NextFunction } from 'express';
import { mockInterviewService } from '../services/mockInterview.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import { getParam } from '../utils/params.js';

export class MockInterviewController {
  async startSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyName, targetRole, resumeId } = req.body;
      const session = await mockInterviewService.startSession(req.user!.id, companyName, targetRole, resumeId);
      return sendCreated(res, session, 'Mock interview session initialized with personalized questions');
    } catch (error) {
      next(error);
    }
  }

  async getSession(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const session = await mockInterviewService.getSession(id, req.user!.id, req.user!.role);
      return sendSuccess(res, session);
    } catch (error) {
      next(error);
    }
  }

  async submitAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const { questionNumber, studentAnswer } = req.body;
      const evaluation = await mockInterviewService.submitAnswer(
        id,
        questionNumber,
        studentAnswer,
        req.user!.id
      );
      return sendSuccess(res, evaluation, 'Answer evaluated');
    } catch (error) {
      next(error);
    }
  }

  async completeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const report = await mockInterviewService.completeSession(id, req.user!.id);
      return sendSuccess(res, report, 'Mock interview completed and report generated');
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await mockInterviewService.getStudentSessionHistory(req.user!.id);
      return sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }
}

export const mockInterviewController = new MockInterviewController();
