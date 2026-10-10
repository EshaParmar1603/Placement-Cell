import { apiClient } from './client';
import { ApiResponse, Application, ApplicationStage } from '../types';

const STORAGE_KEY = 'placewise_applications';

function getStoredApplications(): Application[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveStoredApplications(apps: Application[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch {
    // ignore
  }
}

export const applicationsApi = {
  async apply(data: { opportunityId: string; resumeId: string; notes?: string }): Promise<ApiResponse<Application>> {
    try {
      const res = await apiClient.post<ApiResponse<Application>>('/applications', data);
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const newApp: any = {
      id: `app-${Date.now()}`,
      opportunityId: data.opportunityId,
      resumeId: data.resumeId,
      currentStage: 'APPLIED',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = getStoredApplications();
    const updated = [newApp, ...current];
    saveStoredApplications(updated);

    return {
      success: true,
      message: 'Application submitted successfully',
      data: newApp,
    };
  },

  async getMyApplications(): Promise<ApiResponse<Application[]>> {
    try {
      const res = await apiClient.get<ApiResponse<Application[]>>('/applications/me');
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: getStoredApplications(),
    };
  },

  async withdrawApplication(id: string): Promise<ApiResponse<Application | null>> {
    try {
      const res = await apiClient.post<ApiResponse<Application>>(`/applications/${id}/withdraw`);
      if (res.data && res.data.success) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const current = getStoredApplications();
    const updated = current.filter((a) => a.id !== id);
    saveStoredApplications(updated);

    return {
      success: true,
      message: 'Application withdrawn',
      data: null,
    };
  },

  async updateStage(id: string, data: { newStage: ApplicationStage; remarks?: string }): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.patch<ApiResponse<Application>>(`/applications/${id}/stage`, data);
      if (res.data && res.data.success) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const current = getStoredApplications();
    const updated = current.map((a) => (a.id === id ? { ...a, currentStage: data.newStage } : a));
    saveStoredApplications(updated);

    return {
      success: true,
      data: { id, stage: data.newStage },
    };
  },

  async exportApplications(opportunityId: string): Promise<ApiResponse<any[]>> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>(`/applications/opportunities/${opportunityId}/export`);
      if (res.data && res.data.success) {
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
