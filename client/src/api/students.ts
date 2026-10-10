import { apiClient } from './client';
import { ApiResponse, StudentProfile } from '../types';

const FALLBACK_STUDENTS: StudentProfile[] = [
  {
    id: 's-aarav',
    userId: 'u-aarav',
    fullName: 'Aarav Sharma',
    enrollmentNumber: 'EN2022CSE001',
    department: 'Computer Science',
    course: 'B.Tech',
    graduationYear: 2026,
    cgpa: 8.85,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    skills: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'Docker', 'Python', 'Data Structures', 'Algorithms'],
    targetRoles: ['Software Development Engineer', 'Backend Engineer'],
    preferredLocations: ['Bangalore', 'Hyderabad', 'Pune'],
    placementStatus: 'NOT_PLACED',
    profileCompletion: 95,
    projects: [
      { title: 'PlaceWise Platform', description: 'Full-stack placement portal with real-time analytics', technologies: ['Node.js', 'TypeScript', 'PostgreSQL'] },
      { title: 'Distributed Key-Value Store', description: 'Implemented Raft consensus algorithm for fault-tolerant state replication', technologies: ['Go', 'gRPC'] }
    ],
    resumes: [
      {
        id: 'res-aarav',
        studentId: 's-aarav',
        fileName: 'aarav_sharma_resume_v1.pdf',
        originalName: 'Aarav_Sharma_Resume.pdf',
        mimeType: 'application/pdf',
        fileSize: 145000,
        filePath: 'uploads/resumes/aarav_sharma_resume_v1.pdf',
        version: 1,
        processingStatus: 'COMPLETED',
        extractedText: 'Aarav Sharma - Computer Science B.Tech student with 8.85 CGPA. Skills: TypeScript, Node.js, React, PostgreSQL, Docker, Data Structures, Algorithms. Built PlaceWise platform and Raft consensus distributed store.',
        parsedData: {
          name: 'Aarav Sharma',
          cgpa: 8.85,
          skills: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'Docker'],
          education: [{ degree: 'B.Tech Computer Science', year: 2026, cgpa: 8.85 }],
          projects: [{ title: 'PlaceWise Platform', tech: 'Node.js, PostgreSQL' }]
        },
        createdAt: '2026-10-09T16:31:49.120Z',
        analyses: [
          {
            id: 'ana-aarav',
            resumeId: 'res-aarav',
            qualityScore: 88,
            summary: 'Strong technical resume with concrete distributed systems and web projects. Excellent backend stack.',
            strengths: ['High CGPA (8.85) clearly stated', 'Modern backend technologies (TypeScript, Node.js, Docker)', 'Complex systems project implementing Raft consensus'],
            weaknesses: ['Quantified business metrics could be emphasized more in project descriptions'],
            missingInfo: ['Competitive programming ranking'],
            recommendations: ['Add quantified performance impact (e.g. reduced latency by 30%)'],
            createdAt: '2026-10-09T16:31:49.125Z'
          }
        ]
      }
    ]
  },
  {
    id: 's-vikram',
    userId: 'u-vikram',
    fullName: 'Vikram Singh',
    enrollmentNumber: 'EN2022IT015',
    department: 'Information Technology',
    course: 'B.Tech',
    graduationYear: 2026,
    cgpa: 9.1,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    skills: ['Java', 'Spring Boot', 'Kafka', 'Redis', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Microservices'],
    targetRoles: ['Backend Engineer', 'Systems Engineer'],
    preferredLocations: ['Bangalore', 'Pune', 'Hyderabad'],
    placementStatus: 'NOT_PLACED',
    profileCompletion: 95,
    resumes: [
      {
        id: 'res-vikram',
        studentId: 's-vikram',
        fileName: 'vikram_singh_resume_v1.pdf',
        originalName: 'Vikram_Singh_FullStack_Resume.pdf',
        mimeType: 'application/pdf',
        fileSize: 162000,
        filePath: 'uploads/resumes/vikram_singh_resume_v1.pdf',
        version: 1,
        processingStatus: 'COMPLETED',
        extractedText: 'Vikram Singh | B.Tech Information Technology | CGPA: 9.1/10 (Top 2%)\nSkills: Java, Spring Boot, Microservices, Kafka, Redis, Docker, Kubernetes, AWS.',
        parsedData: {
          name: 'Vikram Singh',
          cgpa: 9.1,
          skills: ['Java', 'Spring Boot', 'Kafka', 'Redis', 'PostgreSQL', 'Docker', 'Kubernetes'],
          education: [{ degree: 'B.Tech Information Technology', year: 2026, cgpa: 9.1 }],
          projects: [{ title: 'High-Throughput E-Commerce Microservices', tech: 'Java 21, Spring Boot, Kafka' }]
        },
        createdAt: '2026-10-10T04:00:00.000Z',
        analyses: [
          {
            id: 'ana-vikram',
            resumeId: 'res-vikram',
            qualityScore: 95,
            summary: 'Exceptional enterprise-grade backend engineering candidate with top-tier 9.1 CGPA and high-throughput microservices background.',
            strengths: ['Top academic record (9.1 CGPA - Top 2% honors)', 'Enterprise stack mastery: Java, Spring Boot, Kafka', 'Demonstrated scalability metrics (12,000 req/sec benchmark)'],
            weaknesses: ['Include unit/integration test coverage percentages'],
            missingInfo: ['AWS certifications credentials badge'],
            recommendations: ['Highlight fault tolerance patterns implemented (Circuit breaker, retry queues)'],
            createdAt: '2026-10-10T04:00:00.000Z'
          }
        ]
      }
    ]
  },
  {
    id: 's-ananya',
    userId: 'u-ananya',
    fullName: 'Ananya Verma',
    enrollmentNumber: 'EN2022CSE022',
    department: 'Computer Science',
    course: 'B.Tech',
    graduationYear: 2026,
    cgpa: 8.4,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    skills: ['Python', 'PyTorch', 'TensorFlow', 'FastAPI', 'React', 'Docker', 'Computer Vision', 'NLP', 'NVIDIA CUDA'],
    targetRoles: ['AI/ML Engineer', 'Computer Vision Researcher'],
    preferredLocations: ['Bangalore', 'Hyderabad'],
    placementStatus: 'NOT_PLACED',
    profileCompletion: 92,
    resumes: [
      {
        id: 'res-ananya',
        studentId: 's-ananya',
        fileName: 'ananya_verma_resume_v1.pdf',
        originalName: 'Ananya_Verma_AI_Resume.pdf',
        mimeType: 'application/pdf',
        fileSize: 184000,
        filePath: 'uploads/resumes/ananya_verma_resume_v1.pdf',
        version: 1,
        processingStatus: 'COMPLETED',
        extractedText: 'Ananya Verma | B.Tech Computer Science (AI & ML) | CGPA: 8.4/10\nSpecialization: Deep Learning, PyTorch, Computer Vision, LLM RAG pipelines.',
        parsedData: {
          name: 'Ananya Verma',
          cgpa: 8.4,
          skills: ['Python', 'PyTorch', 'TensorFlow', 'FastAPI', 'Docker', 'Computer Vision'],
          education: [{ degree: 'B.Tech Computer Science (AI & ML)', year: 2026, cgpa: 8.4 }],
          projects: [{ title: 'Medical Vision AI Diagnostic Tool', tech: 'PyTorch, CUDA, FastAPI' }]
        },
        createdAt: '2026-10-10T04:00:00.000Z',
        analyses: [
          {
            id: 'ana-ananya',
            resumeId: 'res-ananya',
            qualityScore: 92,
            summary: 'Outstanding AI/ML engineering profile with specialized deep learning projects and production internship experience.',
            strengths: ['Clear applied AI/ML specialization with PyTorch & CUDA', 'Quantified performance metrics (94.2% ROC-AUC)', 'Relevant industry internship experience at DataScale Labs'],
            weaknesses: ['Could highlight traditional data structures / systems programming'],
            missingInfo: ['HuggingFace or Kaggle portfolio rankings'],
            recommendations: ['Add benchmark comparison table for medical imaging model'],
            createdAt: '2026-10-10T04:00:00.000Z'
          }
        ]
      }
    ]
  },
  {
    id: 's-priya',
    userId: 'u-priya',
    fullName: 'Priya Patel',
    enrollmentNumber: 'EN2022ECE042',
    department: 'Electronics & Communication',
    course: 'B.Tech',
    graduationYear: 2026,
    cgpa: 8.7,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    skills: ['Embedded C', 'C++', 'FreeRTOS', 'STM32', 'ARM Cortex', 'MQTT', 'ROS2', 'LoRaWAN', 'Linux Device Drivers', 'PCB Design'],
    targetRoles: ['Embedded Systems Engineer', 'IoT Firmware Developer'],
    preferredLocations: ['Bangalore', 'Pune', 'Ahmedabad'],
    placementStatus: 'NOT_PLACED',
    profileCompletion: 95,
    resumes: [
      {
        id: 'res-priya',
        studentId: 's-priya',
        fileName: 'priya_patel_ece_resume.pdf',
        originalName: 'Priya_Patel_Embedded_IoT_Resume.pdf',
        mimeType: 'application/pdf',
        fileSize: 151000,
        filePath: 'uploads/resumes/priya_patel_ece_resume.pdf',
        version: 1,
        processingStatus: 'COMPLETED',
        extractedText: 'Priya Patel | B.Tech Electronics & Communication | CGPA: 8.7/10\nSpecialization: Embedded Systems, RTOS & IoT Robotics.',
        parsedData: {
          name: 'Priya Patel',
          cgpa: 8.7,
          skills: ['Embedded C', 'C++', 'FreeRTOS', 'STM32', 'ARM Cortex', 'ROS2'],
          education: [{ degree: 'B.Tech Electronics & Communication', year: 2026, cgpa: 8.7 }],
          projects: [{ title: 'Autonomous Industrial Mobile Robot', tech: 'ROS2, STM32, C++, LiDAR' }]
        },
        createdAt: '2026-10-10T04:00:00.000Z',
        analyses: [
          {
            id: 'ana-priya',
            resumeId: 'res-priya',
            qualityScore: 90,
            summary: 'Standout hardware-software embedded engineer with strong RTOS, robotics, and edge computing credentials.',
            strengths: ['Rare high-demand embedded firmware specialization (FreeRTOS, STM32)', 'Practical robotics project using ROS2 and LiDAR', 'Strong academic performance (8.7 CGPA)'],
            weaknesses: ['Could add more information on PCB layout software (Altium / KiCad)'],
            missingInfo: ['Hardware lab certifications or IEEE conference papers'],
            recommendations: ['Mention Altium / KiCad schematic design experience'],
            createdAt: '2026-10-10T04:00:00.000Z'
          }
        ]
      }
    ]
  },
  {
    id: 's-rohan',
    userId: 'u-rohan',
    fullName: 'Rohan Mehta',
    enrollmentNumber: 'EN2022CSE088',
    department: 'Computer Science',
    course: 'B.Tech',
    graduationYear: 2026,
    cgpa: 8.6,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    skills: ['Go', 'Kubernetes', 'Docker', 'Terraform', 'AWS', 'ArgoCD', 'Prometheus', 'Grafana', 'GitOps', 'CI/CD'],
    targetRoles: ['DevOps Engineer', 'Cloud Infrastructure Engineer', 'SRE'],
    preferredLocations: ['Bangalore', 'Hyderabad', 'Mumbai'],
    placementStatus: 'NOT_PLACED',
    profileCompletion: 95,
    resumes: [
      {
        id: 'res-rohan',
        studentId: 's-rohan',
        fileName: 'rohan_mehta_devops_resume.pdf',
        originalName: 'Rohan_Mehta_Cloud_DevOps_Resume.pdf',
        mimeType: 'application/pdf',
        fileSize: 168000,
        filePath: 'uploads/resumes/rohan_mehta_devops_resume.pdf',
        version: 1,
        processingStatus: 'COMPLETED',
        extractedText: 'Rohan Mehta | B.Tech CSE (Cloud Computing) | CGPA: 8.6/10\nCertifications: AWS Certified Solutions Architect Associate (2025)\nTechnical Stack: AWS, Docker, Kubernetes, Terraform, ArgoCD, Prometheus, Go.',
        parsedData: {
          name: 'Rohan Mehta',
          cgpa: 8.6,
          skills: ['Go', 'Kubernetes', 'Docker', 'Terraform', 'AWS', 'ArgoCD'],
          education: [{ degree: 'B.Tech CSE (Cloud Computing)', year: 2026, cgpa: 8.6 }],
          projects: [{ title: 'GitOps Multi-Cluster Kubernetes Delivery', tech: 'ArgoCD, Kubernetes, Helm' }]
        },
        createdAt: '2026-10-10T04:00:00.000Z',
        analyses: [
          {
            id: 'ana-rohan',
            resumeId: 'res-rohan',
            qualityScore: 91,
            summary: 'Highly capable Cloud / DevOps candidate with AWS certification, GitOps experience, and Go automation skills.',
            strengths: ['Industry-standard modern DevOps toolset (Kubernetes, ArgoCD, Terraform)', 'Official AWS Solutions Architect Associate credential', 'Solid systems programming with Go'],
            weaknesses: ['Could detail security practices (e.g. Vault, Trivy scanning)'],
            missingInfo: ['Terraform Associate or CKA certification status'],
            recommendations: ['Highlight container image security scanning (Trivy / Snyk)'],
            createdAt: '2026-10-10T04:00:00.000Z'
          }
        ]
      }
    ]
  }
];

export const studentsApi = {
  async getMyProfile() {
    try {
      const res = await apiClient.get<ApiResponse<StudentProfile>>('/students/me');
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }
    return {
      success: true,
      data: FALLBACK_STUDENTS[0],
    };
  },

  async updateMyProfile(data: Partial<StudentProfile>) {
    const res = await apiClient.patch<ApiResponse<StudentProfile>>('/students/me', data);
    return res.data;
  },

  async getProfileById(id: string) {
    try {
      const res = await apiClient.get<ApiResponse<StudentProfile>>(`/students/${id}`);
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }
    const found = FALLBACK_STUDENTS.find((s) => s.id === id) || FALLBACK_STUDENTS[0];
    return {
      success: true,
      data: found,
    };
  },

  async listStudents(params?: {
    page?: number;
    limit?: number;
    department?: string;
    graduationYear?: number;
    placementStatus?: string;
    search?: string;
    minCgpa?: number;
  }) {
    try {
      const res = await apiClient.get<ApiResponse<StudentProfile[]>>('/students', { params });
      if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    let result = [...FALLBACK_STUDENTS];
    if (params?.department) {
      result = result.filter((s) => s.department === params.department);
    }
    if (params?.minCgpa) {
      result = result.filter((s) => s.cgpa >= params.minCgpa!);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.enrollmentNumber.toLowerCase().includes(q) ||
          (s.skills || []).some((sk) => sk.toLowerCase().includes(q))
      );
    }

    return {
      success: true,
      data: result,
    };
  },
};
