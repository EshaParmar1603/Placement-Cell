import { Request, Response, NextFunction } from 'express';
import { jobMatchingService } from '../services/jobMatching.service.js';
import { sendSuccess } from '../utils/response.js';
import { BadRequestError } from '../utils/appError.js';
import { getParam } from '../utils/params.js';

export class JobMatchingController {
  async evaluateMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const studentProfileId = req.user!.studentProfileId;
      if (!studentProfileId) {
        throw new BadRequestError('User does not have a student profile');
      }

      const opportunityId = getParam(req, 'opportunityId');
      const { resumeId } = req.query as { resumeId?: string };

      const result = await jobMatchingService.evaluateMatch(studentProfileId, opportunityId, resumeId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const jobMatchingController = new JobMatchingController();
