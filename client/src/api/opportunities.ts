import { apiClient } from './client';
import { ApiResponse, Opportunity } from '../types';

const STORAGE_KEY = 'placewise_opportunities';

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    companyId: 'comp-1',
    company: {
      id: 'comp-1',
      name: 'Google India',
      industry: 'Software & Cloud Services',
      description: 'Global tech leader pioneering AI, distributed systems, and web scale infrastructure.',
      verifiedByManager: true,
      websiteUrl: 'https://careers.google.com',
    },
    title: 'Software Development Engineer (SWE)',
    description: 'Design and build next-generation distributed systems, web applications, and algorithmic microservices.',
    employmentType: 'FULL_TIME',
    location: 'Bengaluru / Hyderabad',
    salaryMin: 2800000,
    salaryMax: 3500000,
    deadline: '2026-11-15T23:59:59.000Z',
    minCgpa: 8.0,
    allowedDepartments: ['CSE', 'IT', 'ECE'],
    allowedGraduationYears: [2026, 2027],
    maxBacklogsAllowed: 0,
    requiredSkills: ['Data Structures', 'Algorithms', 'Java', 'Python', 'System Design'],
    preferredSkills: ['Kubernetes', 'Go', 'GCP'],
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    _count: { applications: 48 },
  },
  {
    id: 'opp-2',
    companyId: 'comp-2',
    company: {
      id: 'comp-2',
      name: 'Microsoft India',
      industry: 'Enterprise Software & Cloud',
      description: 'Empowering every person and organization on the planet to achieve more through Azure and AI.',
      verifiedByManager: true,
      websiteUrl: 'https://careers.microsoft.com',
    },
    title: 'Cloud Solutions & AI Engineer',
    description: 'Architect scalable cloud services and generative AI tools on Azure architecture.',
    employmentType: 'FULL_TIME',
    location: 'Bengaluru / Noida',
    salaryMin: 2600000,
    salaryMax: 3200000,
    deadline: '2026-11-20T23:59:59.000Z',
    minCgpa: 7.8,
    allowedDepartments: ['CSE', 'IT', 'ECE', 'EEE'],
    allowedGraduationYears: [2026],
    maxBacklogsAllowed: 0,
    requiredSkills: ['C#', 'Python', 'Azure', 'Microservices', 'REST APIs'],
    preferredSkills: ['Docker', 'CosmosDB', 'OpenAI APIs'],
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    _count: { applications: 62 },
  },
  {
    id: 'opp-3',
    companyId: 'comp-3',
    company: {
      id: 'comp-3',
      name: 'Amazon India',
      industry: 'E-Commerce, Cloud & Logistics',
      description: 'Customer obsession, innovation, and large-scale transactional architecture.',
      verifiedByManager: true,
      websiteUrl: 'https://amazon.jobs',
    },
    title: 'SDE-1 (Distributed Systems)',
    description: 'Build high-throughput, low-latency microservices for Prime, AWS, and retail workflows.',
    employmentType: 'FULL_TIME',
    location: 'Hyderabad / Chennai',
    salaryMin: 2700000,
    salaryMax: 3400000,
    deadline: '2026-11-28T23:59:59.000Z',
    minCgpa: 7.5,
    allowedDepartments: ['CSE', 'IT', 'ECE'],
    allowedGraduationYears: [2026],
    maxBacklogsAllowed: 1,
    requiredSkills: ['Java', 'Algorithms', 'SQL', 'AWS', 'Object Oriented Design'],
    preferredSkills: ['DynamoDB', 'Kafka', 'React'],
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    _count: { applications: 85 },
  },
  {
    id: 'opp-4',
    companyId: 'comp-4',
    company: {
      id: 'comp-4',
      name: 'NVIDIA',
      industry: 'Semiconductor, AI & Computing',
      description: 'World leader in GPU computing, CUDA, deep learning systems, and computer vision.',
      verifiedByManager: true,
      websiteUrl: 'https://nvidia.com/careers',
    },
    title: 'Deep Learning & Systems Engineer',
    description: 'Accelerate AI pipelines, GPU kernels, and high performance parallel computing.',
    employmentType: 'FULL_TIME',
    location: 'Bengaluru / Pune',
    salaryMin: 3000000,
    salaryMax: 4000000,
    deadline: '2026-12-05T23:59:59.000Z',
    minCgpa: 8.5,
    allowedDepartments: ['CSE', 'IT', 'ECE'],
    allowedGraduationYears: [2026],
    maxBacklogsAllowed: 0,
    requiredSkills: ['C++', 'CUDA', 'Python', 'PyTorch', 'Computer Architecture'],
    preferredSkills: ['Linux Kernels', 'TensorRT', 'LLMs'],
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    _count: { applications: 39 },
  },
];

function getStoredOpportunities(): Opportunity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_OPPORTUNITIES;
}

function saveStoredOpportunities(opps: Opportunity[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(opps));
  } catch {
    // ignore
  }
}

export const opportunitiesApi = {
  async listOpportunities(params?: {
    status?: string;
    search?: string;
    department?: string;
    employmentType?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Opportunity[]>> {
    try {
      const res = await apiClient.get<ApiResponse<Opportunity[]>>('/opportunities', { params });
      if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback to local storage
    }

    let opps = getStoredOpportunities();
    if (params?.status) {
      opps = opps.filter((o) => o.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      opps = opps.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.company.name.toLowerCase().includes(q) ||
          o.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (params?.department) {
      opps = opps.filter((o) => o.allowedDepartments.includes(params.department!));
    }
    if (params?.employmentType) {
      opps = opps.filter((o) => o.employmentType === params.employmentType);
    }

    return {
      success: true,
      data: opps,
    };
  },

  async getOpportunityById(id: string): Promise<ApiResponse<Opportunity>> {
    try {
      const res = await apiClient.get<ApiResponse<Opportunity>>(`/opportunities/${id}`);
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const opp = getStoredOpportunities().find((o) => o.id === id) || INITIAL_OPPORTUNITIES[0];
    return {
      success: true,
      data: opp,
    };
  },

  async createOpportunity(data: any): Promise<ApiResponse<Opportunity>> {
    try {
      const res = await apiClient.post<ApiResponse<Opportunity>>('/opportunities', data);
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      companyId: `comp-${Date.now()}`,
      company: {
        id: `comp-${Date.now()}`,
        name: data.companyName || 'Campus Partner',
        industry: data.industry || 'Technology',
        verifiedByManager: true,
      },
      title: data.title || 'Campus Opportunity',
      description: data.description || '',
      employmentType: data.employmentType || 'FULL_TIME',
      location: data.location || 'Pan India',
      salaryMin: Number(data.salaryMin) || 1200000,
      salaryMax: Number(data.salaryMax) || 1800000,
      deadline: data.deadline || new Date(Date.now() + 14 * 86400000).toISOString(),
      minCgpa: Number(data.minCgpa) || 7.0,
      allowedDepartments: Array.isArray(data.allowedDepartments) ? data.allowedDepartments : ['CSE', 'IT'],
      allowedGraduationYears: [2026],
      maxBacklogsAllowed: 0,
      requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills : ['Problem Solving'],
      preferredSkills: [],
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
      _count: { applications: 0 },
    };

    const current = getStoredOpportunities();
    const updated = [newOpp, ...current];
    saveStoredOpportunities(updated);

    return {
      success: true,
      message: 'Opportunity created successfully',
      data: newOpp,
    };
  },

  async updateOpportunity(id: string, data: any): Promise<ApiResponse<Opportunity>> {
    try {
      const res = await apiClient.patch<ApiResponse<Opportunity>>(`/opportunities/${id}`, data);
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const current = getStoredOpportunities();
    const updated = current.map((o) => (o.id === id ? { ...o, ...data } : o));
    saveStoredOpportunities(updated);
    const item = updated.find((o) => o.id === id) || INITIAL_OPPORTUNITIES[0];

    return {
      success: true,
      data: item,
    };
  },

  async publishOpportunity(id: string): Promise<ApiResponse<Opportunity>> {
    return this.updateOpportunity(id, { status: 'PUBLISHED' });
  },

  async closeOpportunity(id: string): Promise<ApiResponse<Opportunity>> {
    return this.updateOpportunity(id, { status: 'CLOSED' });
  },

  async getApplicants(id: string): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.get<ApiResponse<any>>(`/opportunities/${id}/applicants`);
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
