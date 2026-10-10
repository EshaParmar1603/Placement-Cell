import { apiClient } from './client';
import { ApiResponse, Opportunity } from '../types';

export const opportunitiesApi = {
  async listOpportunities(params?: {
    status?: string;
    search?: string;
    department?: string;
    employmentType?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await apiClient.get<ApiResponse<Opportunity[]>>('/opportunities', { params });
    return res.data;
  },

  async getOpportunityById(id: string) {
    const res = await apiClient.get<ApiResponse<Opportunity>>(`/opportunities/${id}`);
    return res.data;
  },

  async createOpportunity(data: any) {
    const res = await apiClient.post<ApiResponse<Opportunity>>('/opportunities', data);
    return res.data;
  },

  async updateOpportunity(id: string, data: any) {
    const res = await apiClient.patch<ApiResponse<Opportunity>>(`/opportunities/${id}`, data);
    return res.data;
  },

  async publishOpportunity(id: string) {
    const res = await apiClient.post<ApiResponse<Opportunity>>(`/opportunities/${id}/publish`);
    return res.data;
  },

  async closeOpportunity(id: string) {
    const res = await apiClient.post<ApiResponse<Opportunity>>(`/opportunities/${id}/close`);
    return res.data;
  },

  async getApplicants(id: string) {
    const res = await apiClient.get<ApiResponse<any>>(`/opportunities/${id}/applicants`);
    return res.data;
  },
};
