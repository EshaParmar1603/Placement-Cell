export interface ParsedResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills: string[];
  education: Array<{ degree: string; institution?: string; year?: number; cgpaOrPercentage?: string }>;
  projects: Array<{ title: string; description: string; technologies?: string[] }>;
  experience: Array<{ role: string; company: string; duration?: string; description?: string }>;
  certifications: Array<{ name: string; issuer?: string; year?: number }>;
}

export interface ResumeAnalysisResult {
  qualityScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingInfo: string[];
  recommendations: string[];
}

export interface JobMatchResult {
  matchScore: number;
  skillBreakdown: Array<{
    skill: string;
    status: 'MATCHED' | 'MISSING' | 'PARTIAL';
    evidence?: string;
  }>;
  missingRequiredSkills: string[];
  recommendations: string[];
}

export interface MockInterviewQuestionsResult {
  questions: Array<{
    questionNumber: number;
    category: 'TECHNICAL' | 'PROJECT_BASED' | 'BEHAVIORAL' | 'HR';
    questionText: string;
  }>;
}

export interface AnswerEvaluationResult {
  score: number;
  technicalScore: number;
  problemSolvingScore: number;
  communicationScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  modelAnswerOutline: string;
}

export interface IAiService {
  name: string;
  parseResume(text: string): Promise<ParsedResumeData>;
  analyzeResume(parsedData: ParsedResumeData, rawText: string): Promise<ResumeAnalysisResult>;
  matchResumeToJob(
    parsedData: ParsedResumeData,
    jobTitle: string,
    jobDescription: string,
    requiredSkills: string[],
    preferredSkills: string[]
  ): Promise<JobMatchResult>;
  generateMockInterviewQuestions(
    targetCompany: string,
    targetRole: string,
    resumeSummary: string,
    skills: string[],
    count?: number
  ): Promise<MockInterviewQuestionsResult>;
  evaluateInterviewAnswer(
    questionText: string,
    category: string,
    studentAnswer: string,
    targetRole: string
  ): Promise<AnswerEvaluationResult>;
}
