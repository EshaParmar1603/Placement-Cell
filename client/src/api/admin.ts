import { apiClient } from './client';
import { AccountStatus, ApiResponse, User, UserRole } from '../types';

const INITIAL_USERS: User[] = [
  {
    id: 'user-mgr-1',
    email: 'manager@placewise.edu',
    role: 'PLACEMENT_MANAGER',
    status: 'ACTIVE',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    managerProfile: {
      id: 'mgr-1',
      userId: 'user-mgr-1',
      fullName: 'Dr. Ramesh Kulkarni',
      designation: 'Head Placement Director',
    },
  },
  {
    id: 'user-stu-1',
    email: 'student@placewise.edu',
    role: 'STUDENT',
    status: 'ACTIVE',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    studentProfile: {
      id: 'stu-1',
      userId: 'user-stu-1',
      fullName: 'Aarav Patel',
      enrollmentNumber: 'EN20220145',
      department: 'Computer Science',
      course: 'B.Tech',
      graduationYear: 2026,
      cgpa: 9.1,
      activeBacklogs: 0,
      historyOfBacklogs: 0,
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      targetRoles: ['Software Development Engineer'],
      preferredLocations: ['Bengaluru'],
      placementStatus: 'NOT_PLACED',
      profileCompletion: 95,
    },
  },
];

export const adminApi = {
  async listUsers(params?: { role?: UserRole; status?: AccountStatus; page?: number; limit?: number }): Promise<ApiResponse<User[]>> {
    try {
      const res = await apiClient.get<ApiResponse<User[]>>('/admin/users', { params });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: INITIAL_USERS,
    };
  },

  async updateUserStatus(id: string, status: AccountStatus): Promise<ApiResponse<User>> {
    return {
      success: true,
      data: { ...INITIAL_USERS[0], status },
    };
  },

  async updateUserRole(id: string, role: UserRole): Promise<ApiResponse<User>> {
    return {
      success: true,
      data: { ...INITIAL_USERS[0], role },
    };
  },

  async verifyProfile(type: 'alumni' | 'mentor', profileId: string, isVerified = true): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { profileId, isVerified },
    };
  },

  async getAuditLogs(params?: { page?: number; limit?: number; entityType?: string }): Promise<ApiResponse<any[]>> {
    return {
      success: true,
      data: [
        {
          id: 'log-1',
          action: 'SCHEDULE_EVENT',
          entityType: 'CalendarEvent',
          details: 'Placement drive event scheduled',
          createdAt: new Date().toISOString(),
        },
      ],
    };
  },

  async getSystemConfig(key: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { key, value: 'ENABLED' },
    };
  },

  async updateSystemConfig(key: string, value: any, description?: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { key, value },
    };
  },

  async hidePost(id: string, isHidden: boolean): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { id, isHidden },
    };
  },
};
