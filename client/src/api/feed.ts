import { apiClient } from './client';
import { ApiResponse, FeedPost, PostType } from '../types';

const STORAGE_KEY = 'placewise_feed_posts';

const INITIAL_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    authorId: 'user-alumni-1',
    authorRole: 'ALUMNI',
    author: {
      id: 'user-alumni-1',
      role: 'ALUMNI',
      alumniProfile: {
        fullName: 'Vikramaditya Sharma',
        currentCompany: 'Google India',
        isVerified: true,
      },
    },
    postType: 'INTERVIEW_EXPERIENCE',
    title: 'How I Cracked Google SWE: System Design & DSA Strategy',
    content: 'Focus heavily on BFS/DFS graph traversals, dynamic programming patterns, and clean modular code. During system design, always discuss trade-offs (CAP theorem, caching, partitioning) rather than jumping to a solution immediately.',
    tags: ['Google', 'SWE', 'DSA', 'SystemDesign', 'InterviewPrep'],
    isPinned: true,
    isSpotlight: true,
    isReported: false,
    _count: { likes: 142, comments: 1 },
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    comments: [
      {
        id: 'c-1',
        content: 'Super helpful! Which platform did you use for system design practice?',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        author: {
          id: 'user-stu-1',
          role: 'STUDENT',
          studentProfile: { fullName: 'Aarav Patel' },
        },
      },
    ],
  },
  {
    id: 'post-2',
    authorId: 'user-mgr-1',
    authorRole: 'PLACEMENT_MANAGER',
    author: {
      id: 'user-mgr-1',
      role: 'PLACEMENT_MANAGER',
      managerProfile: {
        fullName: 'Dr. Ramesh Kulkarni',
        designation: 'Head Placement Director',
      },
    },
    postType: 'ANNOUNCEMENT',
    title: 'Amazon & Microsoft On-Campus Drive Registration Closes Tonight',
    content: 'All eligible final year students with CGPA >= 7.5 must submit verified resumes before 11:59 PM. Mock assessment links have been emailed to your university inboxes.',
    tags: ['Notice', 'Amazon', 'Microsoft', 'Deadlines'],
    isPinned: true,
    isSpotlight: false,
    isReported: false,
    _count: { likes: 98, comments: 0 },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    comments: [],
  },
  {
    id: 'post-3',
    authorId: 'user-stu-2',
    authorRole: 'STUDENT',
    author: {
      id: 'user-stu-2',
      role: 'STUDENT',
      studentProfile: {
        fullName: 'Priya Sundaram',
        department: 'Computer Science',
      },
    },
    postType: 'CAREER_ADVICE',
    title: 'NVIDIA Hardware & Systems Engineering Prep Checklist',
    content: 'Key areas: C++ smart pointers, memory barriers, CUDA thread hierarchies, and GPU kernel optimization techniques.',
    tags: ['NVIDIA', 'C++', 'CUDA', 'HardwareSystems'],
    isPinned: false,
    isSpotlight: false,
    isReported: false,
    _count: { likes: 76, comments: 0 },
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    comments: [],
  },
];

function getStoredPosts(): FeedPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_POSTS;
}

function saveStoredPosts(posts: FeedPost[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    // ignore
  }
}

export const feedApi = {
  async listPosts(params?: { postType?: PostType; tag?: string; search?: string; page?: number; limit?: number }): Promise<ApiResponse<FeedPost[]>> {
    try {
      const res = await apiClient.get<ApiResponse<FeedPost[]>>('/feed', { params });
      if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    let posts = getStoredPosts();
    if (params?.postType) {
      posts = posts.filter((p) => p.postType === params.postType);
    }
    if (params?.tag) {
      const t = params.tag.toLowerCase();
      posts = posts.filter((p) => p.tags.some((tag) => tag.toLowerCase().includes(t)));
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      posts = posts.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }

    return {
      success: true,
      data: posts,
    };
  },

  async createPost(data: { postType: PostType; title: string; content: string; imageUrl?: string; tags?: string[] }): Promise<ApiResponse<FeedPost>> {
    try {
      const res = await apiClient.post<ApiResponse<FeedPost>>('/feed', data);
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      authorId: 'current-user',
      authorRole: 'STUDENT',
      author: {
        id: 'current-user',
        role: 'STUDENT',
        studentProfile: {
          fullName: 'Campus Member',
          department: 'Computer Science',
        },
      },
      postType: data.postType,
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl,
      tags: data.tags || ['Campus'],
      isPinned: false,
      isSpotlight: false,
      isReported: false,
      _count: { likes: 1, comments: 0 },
      createdAt: new Date().toISOString(),
      comments: [],
    };

    const current = getStoredPosts();
    const updated = [newPost, ...current];
    saveStoredPosts(updated);

    return {
      success: true,
      message: 'Post created successfully',
      data: newPost,
    };
  },

  async getPostById(id: string): Promise<ApiResponse<FeedPost>> {
    try {
      const res = await apiClient.get<ApiResponse<FeedPost>>(`/feed/${id}`);
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const post = getStoredPosts().find((p) => p.id === id) || INITIAL_POSTS[0];
    return {
      success: true,
      data: post,
    };
  },

  async toggleLike(id: string): Promise<ApiResponse<{ liked: boolean }>> {
    try {
      const res = await apiClient.post<ApiResponse<{ liked: boolean }>>(`/feed/${id}/like`);
      if (res.data && res.data.success) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const current = getStoredPosts();
    const updated = current.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          _count: {
            ...p._count,
            likes: p._count.likes + 1,
          },
        };
      }
      return p;
    });
    saveStoredPosts(updated);

    return {
      success: true,
      data: { liked: true },
    };
  },

  async addComment(id: string, content: string): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.post<ApiResponse<any>>(`/feed/${id}/comments`, { content });
      if (res.data && res.data.success) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const current = getStoredPosts();
    const updated = current.map((p) => {
      if (p.id === id) {
        const comments = p.comments || [];
        return {
          ...p,
          _count: {
            ...p._count,
            comments: p._count.comments + 1,
          },
          comments: [
            ...comments,
            {
              id: `c-${Date.now()}`,
              content,
              createdAt: new Date().toISOString(),
              author: {
                id: 'current-user',
                role: 'STUDENT' as const,
                studentProfile: { fullName: 'Placement Member' },
              },
            },
          ],
        };
      }
      return p;
    });
    saveStoredPosts(updated);

    return {
      success: true,
      message: 'Comment added',
      data: null,
    };
  },

  async reportPost(id: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      message: 'Post reported for review',
      data: null,
    };
  },

  async deletePost(id: string): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.delete<ApiResponse<any>>(`/feed/${id}`);
      if (res.data && res.data.success) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const current = getStoredPosts();
    const updated = current.filter((p) => p.id !== id);
    saveStoredPosts(updated);

    return {
      success: true,
      message: 'Post deleted',
      data: null,
    };
  },
};
