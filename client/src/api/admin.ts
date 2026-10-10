import { apiClient } from './client';
import { AccountStatus, ApiResponse, User, UserRole } from '../types';

export const adminApi = {
  async listUsers(params?: { role?: UserRole; status?: AccountStatus; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<User[]>>('/admin/users', { params });
    return res.data;
  },

  async updateUserStatus(id: string, status: AccountStatus) {
    const res = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/status`, { status });
    return res.data;
  },

  async updateUserRole(id: string, role: UserRole) {
    const res = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  async verifyProfile(type: 'alumni' | 'mentor', profileId: string, isVerified = true) {
    const res = await apiClient.patch<ApiResponse>(`/admin/verify/${type}/${profileId}`, { isVerified });
    return res.data;
  },

  async getAuditLogs(params?: { page?: number; limit?: number; entityType?: string }) {
    const res = await apiClient.get<ApiResponse<any[]>>('/admin/audit-logs', { params });
    return res.data;
  },

  async getSystemConfig(key: string) {
    const res = await apiClient.get<ApiResponse<any>>(`/admin/config/${key}`);
    return res.data;
  },

  async updateSystemConfig(key: string, value: any, description?: string) {
    const res = await apiClient.post<ApiResponse<any>>(`/admin/config/${key}`, { value, description });
    return res.data;
  },

  async hidePost(id: string, isHidden: boolean) {
    const res = await apiClient.patch<ApiResponse>(`/admin/posts/${id}/visibility`, { isHidden });
    return res.data;
  },
};
