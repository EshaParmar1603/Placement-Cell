import { apiClient } from './client';
import { ApiResponse, MockInterviewSession } from '../types';

export const mockInterviewsApi = {
  async startSession(data: { companyName: string; targetRole: string; resumeId?: string }) {
    const res = await apiClient.post<ApiResponse<MockInterviewSession>>('/mock-interviews/start', data);
    return res.data;
  },

  async getSession(id: string) {
    const res = await apiClient.get<ApiResponse<MockInterviewSession>>(`/mock-interviews/${id}`);
    return res.data;
  },

  async submitAnswer(id: string, data: { questionNumber: number; studentAnswer: string }) {
    const res = await apiClient.post<ApiResponse<any>>(`/mock-interviews/${id}/answer`, data);
    return res.data;
  },

  async completeSession(id: string) {
    const res = await apiClient.post<ApiResponse<MockInterviewSession>>(`/mock-interviews/${id}/complete`);
    return res.data;
  },

  async getHistory() {
    const res = await apiClient.get<ApiResponse<MockInterviewSession[]>>('/mock-interviews/history');
    return res.data;
  },
};
