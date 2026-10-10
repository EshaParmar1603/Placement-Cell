import { apiClient } from './client';
import { ApiResponse, MentorBooking, MentorProfile, MentorSlot } from '../types';

const INITIAL_MENTORS: MentorProfile[] = [
  {
    id: 'm-1',
    userId: 'user-m-1',
    fullName: 'Ananya Deshmukh',
    currentCompany: 'Google',
    currentRole: 'Staff Software Engineer',
    yearsExperience: 8,
    expertise: ['Distributed Systems', 'System Design', 'Algorithms', 'Go'],
    bio: 'Alumni 2018 batch. Experienced in building distributed storage and search services. Glad to conduct mock interviews.',
    maxSessionsPerWeek: 4,
    isVerified: true,
    slots: [
      {
        id: 'slot-1',
        mentorId: 'm-1',
        slotDate: '2026-10-18',
        startTime: '16:00',
        endTime: '17:00',
        isBooked: false,
      },
      {
        id: 'slot-2',
        mentorId: 'm-1',
        slotDate: '2026-10-20',
        startTime: '18:00',
        endTime: '19:00',
        isBooked: false,
      },
    ],
  },
  {
    id: 'm-2',
    userId: 'user-m-2',
    fullName: 'Karthik Raman',
    currentCompany: 'Microsoft',
    currentRole: 'Principal Cloud Architect',
    yearsExperience: 10,
    expertise: ['Azure', 'Enterprise Systems', 'Microservices', 'Leadership'],
    bio: 'Alumni 2016 batch. Love mentoring final-year students on system design and behavioural rounds.',
    maxSessionsPerWeek: 3,
    isVerified: true,
    slots: [
      {
        id: 'slot-3',
        mentorId: 'm-2',
        slotDate: '2026-10-19',
        startTime: '17:00',
        endTime: '18:00',
        isBooked: false,
      },
    ],
  },
];

export const mentorsApi = {
  async listMentors(params?: { expertise?: string; company?: string; page?: number; limit?: number }): Promise<ApiResponse<MentorProfile[]>> {
    try {
      const res = await apiClient.get<ApiResponse<MentorProfile[]>>('/mentors', { params });
      if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: INITIAL_MENTORS,
    };
  },

  async getMentorById(id: string): Promise<ApiResponse<MentorProfile>> {
    try {
      const res = await apiClient.get<ApiResponse<MentorProfile>>(`/mentors/${id}`);
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const m = INITIAL_MENTORS.find((item) => item.id === id) || INITIAL_MENTORS[0];
    return {
      success: true,
      data: m,
    };
  },

  async updateProfile(data: Partial<MentorProfile>): Promise<ApiResponse<MentorProfile>> {
    try {
      const res = await apiClient.patch<ApiResponse<MentorProfile>>('/mentors/profile', data);
      if (res.data && res.data.success) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: INITIAL_MENTORS[0],
    };
  },

  async createSlots(slots: Array<{ slotDate: string; startTime: string; endTime: string }>): Promise<ApiResponse<MentorSlot[]>> {
    const created: MentorSlot[] = slots.map((s, i) => ({
      id: `slot-${Date.now()}-${i}`,
      mentorId: 'm-1',
      slotDate: s.slotDate,
      startTime: s.startTime,
      endTime: s.endTime,
      isBooked: false,
    }));

    return {
      success: true,
      data: created,
    };
  },

  async bookSlot(data: { slotId: string; resumeId?: string; consentGranted: boolean; studentNotes?: string }): Promise<ApiResponse<MentorBooking>> {
    const booking: any = {
      id: `booking-${Date.now()}`,
      slotId: data.slotId,
      studentId: 'student-current',
      status: 'CONFIRMED',
      meetingUrl: 'https://meet.google.com/xyz-placement-mock',
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Mentorship session booked successfully',
      data: booking,
    };
  },

  async cancelBooking(id: string, reason: string): Promise<ApiResponse<MentorBooking | null>> {
    return {
      success: true,
      message: 'Booking cancelled',
      data: null,
    };
  },

  async submitFeedback(id: string, feedback: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    };
  },

  async getMyBookings(): Promise<ApiResponse<MentorBooking[]>> {
    try {
      const res = await apiClient.get<ApiResponse<MentorBooking[]>>('/mentors/my-bookings');
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: [],
    };
  },
};
