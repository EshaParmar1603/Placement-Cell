import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { sendSuccess } from '../utils/response.js';
import { getParam } from '../utils/params.js';

export class AnalyticsController {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await analyticsService.getOverviewMetrics();
      return sendSuccess(res, metrics);
    } catch (error) {
      next(error);
    }
  }

  async getDemographics(req: Request, res: Response, next: NextFunction) {
    try {
      const breakdown = await analyticsService.getDepartmentAndPlacementBreakdown();
      return sendSuccess(res, breakdown);
    } catch (error) {
      next(error);
    }
  }

  async getFunnel(req: Request, res: Response, next: NextFunction) {
    try {
      const { opportunityId } = req.query as { opportunityId?: string };
      const funnel = await analyticsService.getApplicationFunnel(opportunityId);
      return sendSuccess(res, funnel);
    } catch (error) {
      next(error);
    }
  }

  async getEligibilityAndNonApplicants(req: Request, res: Response, next: NextFunction) {
    try {
      const opportunityId = getParam(req, 'opportunityId');
      const result = await analyticsService.getOpportunityEligibilityAndNonApplicants(opportunityId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
