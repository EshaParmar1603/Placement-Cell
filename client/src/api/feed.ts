import { apiClient } from './client';
import { ApiResponse, FeedPost, PostType } from '../types';

export const feedApi = {
  async listPosts(params?: { postType?: PostType; tag?: string; search?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<FeedPost[]>>('/feed', { params });
    return res.data;
  },

  async createPost(data: { postType: PostType; title: string; content: string; imageUrl?: string; tags?: string[] }) {
    const res = await apiClient.post<ApiResponse<FeedPost>>('/feed', data);
    return res.data;
  },

  async getPostById(id: string) {
    const res = await apiClient.get<ApiResponse<FeedPost>>(`/feed/${id}`);
    return res.data;
  },

  async toggleLike(id: string) {
    const res = await apiClient.post<ApiResponse<{ liked: boolean }>>(`/feed/${id}/like`);
    return res.data;
  },

  async addComment(id: string, content: string) {
    const res = await apiClient.post<ApiResponse<any>>(`/feed/${id}/comments`, { content });
    return res.data;
  },

  async reportPost(id: string) {
    const res = await apiClient.post<ApiResponse<any>>(`/feed/${id}/report`);
    return res.data;
  },

  async deletePost(id: string) {
    const res = await apiClient.delete<ApiResponse<any>>(`/feed/${id}`);
    return res.data;
  },
};
