import { Request, Response, NextFunction } from 'express';
import { companyService } from '../services/company.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import { getParam } from '../utils/params.js';

export class CompanyController {
  async createCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await companyService.createCompany(req.body);
      return sendCreated(res, company, 'Company registered successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const company = await companyService.updateCompany(id, req.body);
      return sendSuccess(res, company, 'Company details updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async listCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, industry, page, limit } = req.query as any;
      const result = await companyService.listCompanies({
        search,
        industry,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      });
      return sendSuccess(res, result.companies, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getCompanyById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const company = await companyService.getCompanyById(id);
      return sendSuccess(res, company);
    } catch (error) {
      next(error);
    }
  }
}

export const companyController = new CompanyController();
