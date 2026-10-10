import { apiClient } from './client';
import { ApiResponse, NotificationItem } from '../types';

export const notificationsApi = {
  async getMyNotifications(params?: { page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<NotificationItem[]>>('/notifications', { params });
    return res.data;
  },

  async markAsRead(id: string) {
    const res = await apiClient.patch<ApiResponse>(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await apiClient.patch<ApiResponse>('/notifications/read-all');
    return res.data;
  },
};
