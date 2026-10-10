import { apiClient } from './client';
import { ApiResponse } from '../types';

export const analyticsApi = {
  async getOverview() {
    const res = await apiClient.get<ApiResponse<any>>('/manager/analytics/overview');
    return res.data;
  },

  async getDemographics() {
    const res = await apiClient.get<ApiResponse<any>>('/manager/analytics/demographics');
    return res.data;
  },

  async getFunnel(opportunityId?: string) {
    const res = await apiClient.get<ApiResponse<any>>('/manager/analytics/funnel', {
      params: { opportunityId },
    });
    return res.data;
  },

  async getNonApplicants(opportunityId: string) {
    const res = await apiClient.get<ApiResponse<any>>(
      `/manager/analytics/opportunities/${opportunityId}/eligibility`
    );
    return res.data;
  },
};
