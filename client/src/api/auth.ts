import { apiClient } from './client';
import { ApiResponse, User } from '../types';

export const authApi = {
  async register(data: any) {
    const res = await apiClient.post<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>>(
      '/auth/register',
      data
    );
    return res.data;
  },

  async login(credentials: { email: string; password: string }) {
    const res = await apiClient.post<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>>(
      '/auth/login',
      credentials
    );
    return res.data;
  },

  async logout(refreshToken?: string) {
    const res = await apiClient.post<ApiResponse>('/auth/logout', { refreshToken });
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  async forgotPassword(email: string) {
    const res = await apiClient.post<ApiResponse>('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(data: { token: string; newPassword: string }) {
    const res = await apiClient.post<ApiResponse>('/auth/reset-password', data);
    return res.data;
  },
};
