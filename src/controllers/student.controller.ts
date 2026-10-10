import { Request, Response, NextFunction } from 'express';
import { studentService } from '../services/student.service.js';
import { sendSuccess } from '../utils/response.js';
import { getParam } from '../utils/params.js';

export class StudentController {
  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await studentService.getMyProfile(req.user!.id);
      return sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await studentService.updateMyProfile(req.user!.id, req.body);
      return sendSuccess(res, updated, 'Student profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProfileById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const profile = await studentService.getProfileById(id, req.user!.role, req.user!.id);
      return sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async listStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, department, graduationYear, placementStatus, search, minCgpa } = req.query as any;
      const result = await studentService.listStudents({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        department,
        graduationYear: graduationYear ? parseInt(graduationYear, 10) : undefined,
        placementStatus,
        search,
        minCgpa: minCgpa ? parseFloat(minCgpa) : undefined,
      });
      return sendSuccess(res, result.students, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }
}

export const studentController = new StudentController();
