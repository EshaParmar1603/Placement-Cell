import { apiClient } from './client';
import { ApiResponse, JobMatchReport } from '../types';

export const matchingApi = {
  async evaluateMatch(opportunityId: string, resumeId?: string) {
    const res = await apiClient.get<ApiResponse<JobMatchReport>>(
      `/job-matches/opportunities/${opportunityId}`,
      { params: { resumeId } }
    );
    return res.data;
  },
};
