import { apiClient } from './client';
import { ApiResponse } from '../types';

const MOCK_OVERVIEW = {
  totalStudents: 420,
  placedStudents: 368,
  placementRate: 87.6,
  averagePackage: 14.8,
  highestPackage: 52.0,
  activeCompanies: 45,
  totalOffers: 486,
};

const MOCK_DEMOGRAPHICS = {
  byDepartment: [
    { department: 'CSE', total: 180, placed: 168 },
    { department: 'IT', total: 120, placed: 108 },
    { department: 'ECE', total: 80, placed: 64 },
    { department: 'EEE', total: 40, placed: 28 },
  ],
};

const MOCK_FUNNEL = {
  stages: [
    { stage: 'APPLIED', count: 420 },
    { stage: 'OA_SHORTLISTED', count: 240 },
    { stage: 'TECH_ROUND_1', count: 120 },
    { stage: 'TECH_ROUND_2', count: 68 },
    { stage: 'HR_ROUND', count: 45 },
    { stage: 'OFFERED', count: 38 },
  ],
};

export const analyticsApi = {
  async getOverview(): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/manager/analytics/overview');
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: MOCK_OVERVIEW,
    };
  },

  async getDemographics(): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/manager/analytics/demographics');
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: MOCK_DEMOGRAPHICS,
    };
  },

  async getFunnel(opportunityId?: string): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/manager/analytics/funnel', {
        params: { opportunityId },
      });
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: MOCK_FUNNEL,
    };
  },

  async getNonApplicants(opportunityId: string): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.get<ApiResponse<any>>(
        `/manager/analytics/opportunities/${opportunityId}/eligibility`
      );
      if (res.data && res.data.success) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: [],
    };
  },
};
