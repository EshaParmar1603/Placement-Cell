import { apiClient } from './client';
import { ApiResponse, Application, ApplicationStage } from '../types';

export const applicationsApi = {
  async apply(data: { opportunityId: string; resumeId: string; notes?: string }) {
    const res = await apiClient.post<ApiResponse<Application>>('/applications', data);
    return res.data;
  },

  async getMyApplications() {
    const res = await apiClient.get<ApiResponse<Application[]>>('/applications/me');
    return res.data;
  },

  async withdrawApplication(id: string) {
    const res = await apiClient.post<ApiResponse<Application>>(`/applications/${id}/withdraw`);
    return res.data;
  },

  async updateStage(id: string, data: { newStage: ApplicationStage; remarks?: string }) {
    const res = await apiClient.patch<ApiResponse<Application>>(`/applications/${id}/stage`, data);
    return res.data;
  },

  async exportApplications(opportunityId: string) {
    const res = await apiClient.get<ApiResponse<any[]>>(`/applications/opportunities/${opportunityId}/export`);
    return res.data;
  },
};
