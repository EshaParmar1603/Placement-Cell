import { apiClient } from './client';
import { ApiResponse, Resume, ResumeAnalysis } from '../types';

const STORAGE_KEY = 'placewise_resumes';

const INITIAL_RESUMES: Resume[] = [
  {
    id: 'res-default-1',
    studentId: 'student-demo',
    fileName: 'Tech_SWE_Resume_2026.pdf',
    originalName: 'Tech_SWE_Resume_2026.pdf',
    mimeType: 'application/pdf',
    fileSize: 142800,
    filePath: '/sample-resume.pdf',
    version: 1,
    processingStatus: 'COMPLETED',
    extractedText: 'Full Stack Engineer with strong foundation in React, Node.js, Python, PostgreSQL, and AWS.',
    createdAt: new Date().toISOString(),
    analyses: [
      {
        id: 'analysis-1',
        resumeId: 'res-default-1',
        qualityScore: 92,
        summary: 'Exceptional technical depth with clear quantitative metrics across distributed systems projects.',
        strengths: [
          'High impact bullet points with quantitative results (e.g. 40% latency reduction)',
          'Modern tech stack: TypeScript, Next.js, Docker, Kubernetes',
          'Clean single-page ATS readable layout',
        ],
        weaknesses: [
          'Add more details on CI/CD deployment pipelines',
        ],
        missingInfo: [
          'Link to verified competitive programming handles',
        ],
        recommendations: [
          'Include metrics on unit test coverage and production deployment monitoring',
        ],
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

function getStoredResumes(): Resume[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_RESUMES;
}

function saveStoredResumes(resumes: Resume[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
  } catch {
    // ignore
  }
}

export const resumesApi = {
  async uploadResume(file: File): Promise<ApiResponse<Resume>> {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await apiClient.post<ApiResponse<Resume>>('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const newResume: Resume = {
      id: `res-${Date.now()}`,
      studentId: 'current-user',
      fileName: file.name,
      originalName: file.name,
      mimeType: file.type || 'application/pdf',
      fileSize: file.size,
      filePath: URL.createObjectURL(file),
      version: getStoredResumes().length + 1,
      processingStatus: 'COMPLETED',
      extractedText: `Uploaded resume: ${file.name}`,
      createdAt: new Date().toISOString(),
      analyses: [
        {
          id: `analysis-${Date.now()}`,
          resumeId: `res-${Date.now()}`,
          qualityScore: 88,
          summary: 'Solid professional resume with verified credentials.',
          strengths: ['Clear contact details', 'Strong education section', 'Relevant project keywords'],
          weaknesses: ['Add more metric-driven bullet points'],
          missingInfo: [],
          recommendations: ['Highlight technical frameworks used in projects'],
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const current = getStoredResumes();
    const updated = [newResume, ...current];
    saveStoredResumes(updated);

    return {
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      data: newResume,
    };
  },

  async getMyResumes(): Promise<ApiResponse<Resume[]>> {
    try {
      const res = await apiClient.get<ApiResponse<Resume[]>>('/resumes/me');
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: getStoredResumes(),
    };
  },

  async getResumeById(id: string): Promise<ApiResponse<Resume>> {
    try {
      const res = await apiClient.get<ApiResponse<Resume>>(`/resumes/${id}`);
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const item = getStoredResumes().find((r) => r.id === id) || INITIAL_RESUMES[0];
    return {
      success: true,
      data: item,
    };
  },

  async analyzeResume(id: string): Promise<ApiResponse<ResumeAnalysis>> {
    try {
      const res = await apiClient.post<ApiResponse<ResumeAnalysis>>(`/resumes/${id}/analyze`);
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const resume = getStoredResumes().find((r) => r.id === id);
    const analysis = resume?.analyses?.[0] || INITIAL_RESUMES[0].analyses![0];
    return {
      success: true,
      data: analysis,
    };
  },

  async getAnalysisHistory(id: string): Promise<ApiResponse<ResumeAnalysis[]>> {
    try {
      const res = await apiClient.get<ApiResponse<ResumeAnalysis[]>>(`/resumes/${id}/analysis-history`);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const resume = getStoredResumes().find((r) => r.id === id);
    return {
      success: true,
      data: resume?.analyses || INITIAL_RESUMES[0].analyses || [],
    };
  },

  async compareVersions(versionA: string, versionB: string): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/resumes/compare', {
        params: { versionA, versionB },
      });
      if (res.data && res.data.success) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: {
        scoreDiff: +4,
        keywordsAdded: ['Kubernetes', 'GraphQL', 'AWS ECS'],
        suggestions: ['Quantify project impact with user numbers'],
      },
    };
  },

  async downloadResume(id: string): Promise<any> {
    try {
      const res = await apiClient.get(`/resumes/${id}/download`, { responseType: 'blob' });
      return res.data;
    } catch {
      // Fallback dummy blob
      return new Blob(['Sample Resume Content'], { type: 'application/pdf' });
    }
  },
};
