import { Request, Response, NextFunction } from 'express';
import { interviewPrepService } from '../services/interviewPrep.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import { BadRequestError } from '../utils/appError.js';
import { getParam } from '../utils/params.js';

export class InterviewPrepController {
  async createTopic(req: Request, res: Response, next: NextFunction) {
    try {
      const topic = await interviewPrepService.createTopic(req.body);
      return sendCreated(res, topic, 'Interview preparation topic created');
    } catch (error) {
      next(error);
    }
  }

  async updateTopic(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const topic = await interviewPrepService.updateTopic(id, req.body);
      return sendSuccess(res, topic, 'Topic updated');
    } catch (error) {
      next(error);
    }
  }

  async deleteTopic(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      await interviewPrepService.deleteTopic(id);
      return sendSuccess(res, { message: 'Topic deleted' });
    } catch (error) {
      next(error);
    }
  }

  async listTopicsByCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getParam(req, 'companyId');
      const { targetRole } = req.query as { targetRole?: string };
      const topics = await interviewPrepService.listTopicsByCompany(companyId, targetRole);
      return sendSuccess(res, topics);
    } catch (error) {
      next(error);
    }
  }

  async getPreparationPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const studentProfileId = req.user!.studentProfileId;
      if (!studentProfileId) {
        throw new BadRequestError('User does not have a student profile');
      }

      const companyId = getParam(req, 'companyId');
      const { targetRole } = req.query as { targetRole: string };

      if (!targetRole) {
        throw new BadRequestError('targetRole query parameter is required');
      }

      const plan = await interviewPrepService.generatePreparationPlan(studentProfileId, companyId, targetRole);
      return sendSuccess(res, plan);
    } catch (error) {
      next(error);
    }
  }
}

export const interviewPrepController = new InterviewPrepController();
