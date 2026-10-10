import { apiClient } from './client';
import { ApiResponse, Company } from '../types';

const STORAGE_KEY = 'placewise_companies';

const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    name: 'Google India',
    industry: 'Software & Cloud Services',
    description: 'Global tech leader pioneering AI, distributed systems, and web scale infrastructure.',
    verifiedByManager: true,
    websiteUrl: 'https://careers.google.com',
  },
  {
    id: 'comp-2',
    name: 'Microsoft India',
    industry: 'Enterprise Software & Cloud',
    description: 'Empowering every person and organization on the planet to achieve more through Azure and AI.',
    verifiedByManager: true,
    websiteUrl: 'https://careers.microsoft.com',
  },
  {
    id: 'comp-3',
    name: 'Amazon India',
    industry: 'E-Commerce, Cloud & Logistics',
    description: 'Customer obsession, innovation, and large-scale transactional architecture.',
    verifiedByManager: true,
    websiteUrl: 'https://amazon.jobs',
  },
  {
    id: 'comp-4',
    name: 'NVIDIA',
    industry: 'Semiconductor, AI & Computing',
    description: 'World leader in GPU computing, CUDA, deep learning systems, and computer vision.',
    verifiedByManager: true,
    websiteUrl: 'https://nvidia.com/careers',
  },
];

function getStoredCompanies(): Company[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_COMPANIES;
}

export const companiesApi = {
  async listCompanies(params?: { industry?: string; search?: string; page?: number; limit?: number }): Promise<ApiResponse<Company[]>> {
    try {
      const res = await apiClient.get<ApiResponse<Company[]>>('/companies', { params });
      if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    let companies = getStoredCompanies();
    if (params?.search) {
      const q = params.search.toLowerCase();
      companies = companies.filter((c) => c.name.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q));
    }
    return {
      success: true,
      data: companies,
    };
  },

  async getCompanyById(id: string): Promise<ApiResponse<Company>> {
    try {
      const res = await apiClient.get<ApiResponse<Company>>(`/companies/${id}`);
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const company = getStoredCompanies().find((c) => c.id === id) || INITIAL_COMPANIES[0];
    return {
      success: true,
      data: company,
    };
  },

  async createCompany(data: Partial<Company>): Promise<ApiResponse<Company>> {
    const newComp: Company = {
      id: `comp-${Date.now()}`,
      name: data.name || 'New Recruiter Partner',
      industry: data.industry || 'Technology',
      description: data.description || '',
      verifiedByManager: true,
      websiteUrl: data.websiteUrl,
    };

    const current = getStoredCompanies();
    const updated = [newComp, ...current];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    return {
      success: true,
      message: 'Company added successfully',
      data: newComp,
    };
  },

  async updateCompany(id: string, data: Partial<Company>): Promise<ApiResponse<Company>> {
    const current = getStoredCompanies();
    const updated = current.map((c) => (c.id === id ? { ...c, ...data } : c));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    return {
      success: true,
      data: updated.find((c) => c.id === id) || INITIAL_COMPANIES[0],
    };
  },
};
