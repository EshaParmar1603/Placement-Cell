import { Request, Response, NextFunction } from 'express';
import { applicationService } from '../services/application.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import { ApplicationStage } from '@prisma/client';
import { BadRequestError } from '../utils/appError.js';
import { getParam } from '../utils/params.js';

export class ApplicationController {
  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const { opportunityId, resumeId, notes } = req.body;
      const application = await applicationService.apply(req.user!.id, opportunityId, resumeId, notes);
      return sendCreated(res, application, 'Application submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const applications = await applicationService.getMyApplications(req.user!.id);
      return sendSuccess(res, applications);
    } catch (error) {
      next(error);
    }
  }

  async withdrawApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const withdrawn = await applicationService.withdrawApplication(req.user!.id, id);
      return sendSuccess(res, withdrawn, 'Application withdrawn successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateStage(req: Request, res: Response, next: NextFunction) {
    try {
      const { newStage, remarks } = req.body;
      const id = getParam(req, 'id');
      if (!Object.values(ApplicationStage).includes(newStage)) {
        throw new BadRequestError(`Invalid stage: ${newStage}`);
      }

      const updated = await applicationService.updateStage(req.user!.id, id, newStage, remarks);
      return sendSuccess(res, updated, `Application moved to ${newStage}`);
    } catch (error) {
      next(error);
    }
  }

  async exportApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const opportunityId = getParam(req, 'opportunityId');
      const report = await applicationService.exportApplications(opportunityId);
      return sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
}

export const applicationController = new ApplicationController();
