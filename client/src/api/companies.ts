import { apiClient } from './client';
import { ApiResponse, Company } from '../types';

export const companiesApi = {
  async listCompanies(params?: { industry?: string; search?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<Company[]>>('/companies', { params });
    return res.data;
  },

  async getCompanyById(id: string) {
    const res = await apiClient.get<ApiResponse<Company>>(`/companies/${id}`);
    return res.data;
  },

  async createCompany(data: Partial<Company>) {
    const res = await apiClient.post<ApiResponse<Company>>('/companies', data);
    return res.data;
  },

  async updateCompany(id: string, data: Partial<Company>) {
    const res = await apiClient.patch<ApiResponse<Company>>(`/companies/${id}`, data);
    return res.data;
  },
};
