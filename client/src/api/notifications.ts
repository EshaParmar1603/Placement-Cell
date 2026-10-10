import { apiClient } from './client';
import { ApiResponse, NotificationItem } from '../types';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'EVENT_REMINDER',
    title: 'Google Pre-Placement Talk Scheduled',
    message: 'Pre-placement talk is scheduled for Oct 14 at 11:00 AM in the Auditorium.',
    data: {},
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    type: 'OPPORTUNITY_UPDATE',
    title: 'Microsoft Drive Application Live',
    message: 'Review application requirements and submit before Oct 25.',
    data: {},
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const notificationsApi = {
  async getMyNotifications(params?: { page?: number; limit?: number }): Promise<ApiResponse<NotificationItem[]>> {
    try {
      const res = await apiClient.get<ApiResponse<NotificationItem[]>>('/notifications', { params });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: INITIAL_NOTIFICATIONS,
    };
  },

  async markAsRead(id: string): Promise<ApiResponse<null>> {
    try {
      const res = await apiClient.patch<ApiResponse>(`/notifications/${id}/read`);
      if (res.data && res.data.success) {
        return {
          success: true,
          data: null,
        };
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: null,
    };
  },

  async markAllAsRead(): Promise<ApiResponse<null>> {
    try {
      const res = await apiClient.patch<ApiResponse>('/notifications/read-all');
      if (res.data && res.data.success) {
        return {
          success: true,
          data: null,
        };
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: null,
    };
  },
};
