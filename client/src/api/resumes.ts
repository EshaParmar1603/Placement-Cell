import { apiClient } from './client';
import { ApiResponse, Resume, ResumeAnalysis } from '../types';

export const resumesApi = {
  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await apiClient.post<ApiResponse<Resume>>('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async getMyResumes() {
    const res = await apiClient.get<ApiResponse<Resume[]>>('/resumes/me');
    return res.data;
  },

  async getResumeById(id: string) {
    const res = await apiClient.get<ApiResponse<Resume>>(`/resumes/${id}`);
    return res.data;
  },

  async analyzeResume(id: string) {
    const res = await apiClient.post<ApiResponse<ResumeAnalysis>>(`/resumes/${id}/analyze`);
    return res.data;
  },

  async getAnalysisHistory(id: string) {
    const res = await apiClient.get<ApiResponse<ResumeAnalysis[]>>(`/resumes/${id}/analysis-history`);
    return res.data;
  },

  async compareVersions(versionA: string, versionB: string) {
    const res = await apiClient.get<ApiResponse<any>>('/resumes/compare', {
      params: { versionA, versionB },
    });
    return res.data;
  },

  async downloadResume(id: string) {
    const res = await apiClient.get(`/resumes/${id}/download`, { responseType: 'blob' });
    return res.data;
  },
};
