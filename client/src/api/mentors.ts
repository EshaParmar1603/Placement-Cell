import { apiClient } from './client';
import { ApiResponse, MentorBooking, MentorProfile, MentorSlot } from '../types';

export const mentorsApi = {
  async listMentors(params?: { expertise?: string; company?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<MentorProfile[]>>('/mentors', { params });
    return res.data;
  },

  async getMentorById(id: string) {
    const res = await apiClient.get<ApiResponse<MentorProfile>>(`/mentors/${id}`);
    return res.data;
  },

  async updateProfile(data: Partial<MentorProfile>) {
    const res = await apiClient.patch<ApiResponse<MentorProfile>>('/mentors/profile', data);
    return res.data;
  },

  async createSlots(slots: Array<{ slotDate: string; startTime: string; endTime: string }>) {
    const res = await apiClient.post<ApiResponse<MentorSlot[]>>('/mentors/slots', { slots });
    return res.data;
  },

  async bookSlot(data: { slotId: string; resumeId?: string; consentGranted: boolean; studentNotes?: string }) {
    const res = await apiClient.post<ApiResponse<MentorBooking>>('/mentors/book', data);
    return res.data;
  },

  async cancelBooking(id: string, reason: string) {
    const res = await apiClient.post<ApiResponse<MentorBooking>>(`/mentors/bookings/${id}/cancel`, { reason });
    return res.data;
  },

  async submitFeedback(
    id: string,
    feedback: {
      technicalRating: number;
      communicationRating: number;
      problemSolvingRating: number;
      overallRating: number;
      summaryComments: string;
      recommendation: string;
    }
  ) {
    const res = await apiClient.post<ApiResponse<MentorBooking>>(`/mentors/bookings/${id}/feedback`, feedback);
    return res.data;
  },

  async getMyBookings() {
    const res = await apiClient.get<ApiResponse<MentorBooking[]>>('/mentors/my-bookings');
    return res.data;
  },
};
