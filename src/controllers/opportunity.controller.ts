import { Request, Response, NextFunction } from 'express';
import { opportunityService } from '../services/opportunity.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import { getParam } from '../utils/params.js';

export class OpportunityController {
  async createOpportunity(req: Request, res: Response, next: NextFunction) {
    try {
      const opp = await opportunityService.createOpportunity(req.user!.id, req.body);
      return sendCreated(res, opp, 'Opportunity created as DRAFT');
    } catch (error) {
      next(error);
    }
  }

  async updateOpportunity(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const opp = await opportunityService.updateOpportunity(id, req.body);
      return sendSuccess(res, opp, 'Opportunity updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async publishOpportunity(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const opp = await opportunityService.publishOpportunity(id);
      return sendSuccess(res, opp, 'Opportunity published and eligible students notified');
    } catch (error) {
      next(error);
    }
  }

  async closeOpportunity(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const opp = await opportunityService.closeOpportunity(id);
      return sendSuccess(res, opp, 'Opportunity closed successfully');
    } catch (error) {
      next(error);
    }
  }

  async listOpportunities(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, department, employmentType, page, limit } = req.query as any;
      const result = await opportunityService.listOpportunities({
        status,
        search,
        department,
        employmentType,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        userRole: req.user?.role,
      });
      return sendSuccess(res, result.opportunities, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getOpportunityById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const opp = await opportunityService.getOpportunityById(id);
      return sendSuccess(res, opp);
    } catch (error) {
      next(error);
    }
  }

  async getOpportunityApplicants(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const applicants = await opportunityService.getOpportunityApplicants(id);
      return sendSuccess(res, applicants);
    } catch (error) {
      next(error);
    }
  }
}

export const opportunityController = new OpportunityController();
