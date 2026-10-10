import { apiClient } from './client';
import { ApiResponse, StudentProfile } from '../types';

export const studentsApi = {
  async getMyProfile() {
    const res = await apiClient.get<ApiResponse<StudentProfile>>('/students/me');
    return res.data;
  },

  async updateMyProfile(data: Partial<StudentProfile>) {
    const res = await apiClient.patch<ApiResponse<StudentProfile>>('/students/me', data);
    return res.data;
  },

  async getProfileById(id: string) {
    const res = await apiClient.get<ApiResponse<StudentProfile>>(`/students/${id}`);
    return res.data;
  },

  async listStudents(params?: {
    page?: number;
    limit?: number;
    department?: string;
    graduationYear?: number;
    placementStatus?: string;
    search?: string;
    minCgpa?: number;
  }) {
    const res = await apiClient.get<ApiResponse<StudentProfile[]>>('/students', { params });
    return res.data;
  },
};
