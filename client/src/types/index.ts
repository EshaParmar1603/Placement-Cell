export type UserRole = 'STUDENT' | 'ALUMNI' | 'MENTOR' | 'PLACEMENT_MANAGER' | 'ADMIN';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export type PlacementStatus = 'NOT_PLACED' | 'PLACED' | 'HIGHER_STUDIES' | 'OPTED_OUT';

export type OpportunityStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export type ApplicationStage =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'ASSESSMENT'
  | 'TECHNICAL_INTERVIEW'
  | 'HR_INTERVIEW'
  | 'OFFERED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export type PostType = 'CAREER_ADVICE' | 'INTERVIEW_EXPERIENCE' | 'PLACEMENT_STORY' | 'ANNOUNCEMENT' | 'GENERAL';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  isEmailVerified: boolean;
  createdAt: string;
  studentProfile?: StudentProfile;
  alumniProfile?: AlumniProfile;
  mentorProfile?: MentorProfile;
  managerProfile?: ManagerProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  enrollmentNumber: string;
  department: string;
  course: string;
  graduationYear: number;
  cgpa: number;
  percentage?: number;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  activeBacklogs: number;
  historyOfBacklogs: number;
  skills: string[];
  projects?: Array<{ title: string; description: string; technologies?: string[] }>;
  certifications?: Array<{ name: string; issuer?: string; year?: number }>;
  achievements?: any[];
  workExperience?: any[];
  targetRoles: string[];
  preferredLocations: string[];
  placementStatus: PlacementStatus;
  profileCompletion: number;
  resumes?: Resume[];
  applications?: Application[];
}

export interface AlumniProfile {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  department: string;
  graduationYear: number;
  currentCompany?: string;
  currentRole?: string;
  linkedInUrl?: string;
  isVerified: boolean;
}

export interface MentorProfile {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  currentCompany?: string;
  currentRole?: string;
  yearsExperience: number;
  expertise: string[];
  bio?: string;
  maxSessionsPerWeek: number;
  isVerified: boolean;
  slots?: MentorSlot[];
}

export interface ManagerProfile {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  department?: string;
  designation?: string;
}

export interface Resume {
  id: string;
  studentId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  version: number;
  processingStatus: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  extractedText?: string;
  parsedData?: any;
  createdAt: string;
  analyses?: ResumeAnalysis[];
}

export interface ResumeAnalysis {
  id: string;
  resumeId: string;
  qualityScore: number;
  summary?: string;
  strengths: string[];
  weaknesses: string[];
  missingInfo: string[];
  recommendations: string[];
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  careersUrl?: string;
  industry?: string;
  description?: string;
  verifiedByManager: boolean;
  sourceUrl?: string;
  verificationDate?: string;
  opportunities?: Opportunity[];
  interviewTopics?: InterviewPrepTopic[];
  _count?: { opportunities: number; interviewTopics: number };
}

export interface Opportunity {
  id: string;
  companyId: string;
  company: Company;
  title: string;
  description: string;
  employmentType: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  stipend?: number;
  deadline: string;
  minCgpa: number;
  allowedDepartments: string[];
  allowedGraduationYears: number[];
  maxBacklogsAllowed: number;
  requiredSkills: string[];
  preferredSkills: string[];
  status: OpportunityStatus;
  createdAt: string;
  _count?: { applications: number };
}

export interface Application {
  id: string;
  opportunityId: string;
  opportunity: Opportunity;
  studentId: string;
  student: StudentProfile;
  resumeId: string;
  resume: Resume;
  currentStage: ApplicationStage;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  history?: Array<{
    id: string;
    previousStage: ApplicationStage;
    newStage: ApplicationStage;
    remarks?: string;
    createdAt: string;
  }>;
}

export interface JobMatchReport {
  opportunity: { id: string; title: string; company: string };
  resumeEvaluated?: { id: string; version: number; originalName: string } | null;
  officialEligibility: {
    status: 'ELIGIBLE' | 'INELIGIBLE' | 'UNKNOWN';
    checks: Record<string, string>;
  };
  resumeMatch: {
    score: number;
    skillBreakdown: Array<{ skill: string; status: 'MATCHED' | 'MISSING' | 'PARTIAL'; evidence?: string }>;
    missingRequiredSkills: string[];
    recommendations: string[];
    disclaimer: string;
  };
  reportId: string;
}

export interface InterviewPrepTopic {
  id: string;
  companyId: string;
  company?: Company;
  targetRole: string;
  stageName: string;
  topicName: string;
  category: string;
  description: string;
  practiceQuestions: any[];
  resources: any[];
  sourceUrl?: string;
  verificationDate?: string;
}

export interface MockInterviewSession {
  id: string;
  studentId: string;
  companyName: string;
  targetRole: string;
  resumeId?: string;
  status: string;
  overallScore?: number;
  rubrics?: any;
  feedback?: any;
  createdAt: string;
  completedAt?: string;
  questions: Array<{
    id: string;
    questionNumber: number;
    category: string;
    questionText: string;
    studentAnswer?: string;
    feedback?: string;
    score?: number;
  }>;
}

export interface MentorSlot {
  id: string;
  mentorId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface MentorBooking {
  id: string;
  studentId: string;
  student?: StudentProfile;
  mentorId: string;
  mentor?: MentorProfile;
  slotId: string;
  slot: MentorSlot;
  resumeId?: string;
  resume?: Resume;
  consentGranted: boolean;
  status: BookingStatus;
  studentNotes?: string;
  meetingUrl?: string;
  feedback?: any;
  rating?: number;
  cancellationReason?: string;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorRole: UserRole;
  author: {
    id: string;
    role: UserRole;
    studentProfile?: { fullName: string; department: string };
    alumniProfile?: { fullName: string; currentCompany: string; isVerified: boolean };
    mentorProfile?: { fullName: string; currentCompany: string; isVerified: boolean };
    managerProfile?: { fullName: string; designation: string };
  };
  postType: PostType;
  title: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  isPinned: boolean;
  isSpotlight: boolean;
  isReported: boolean;
  createdAt: string;
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      role: UserRole;
      studentProfile?: { fullName: string };
      alumniProfile?: { fullName: string };
      mentorProfile?: { fullName: string };
      managerProfile?: { fullName: string };
    };
  }>;
  _count: { comments: number; likes: number };
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  eventType:
    | 'DRIVE_DEADLINE'
    | 'PRE_PLACEMENT_TALK'
    | 'ONLINE_ASSESSMENT'
    | 'TECHNICAL_INTERVIEW'
    | 'HR_INTERVIEW'
    | 'RESULT_ANNOUNCEMENT'
    | 'CAMPUS_VISIT';
  date: string; // YYYY-MM-DD
  time?: string;
  companyName?: string;
  opportunityId?: string;
  locationOrLink?: string;
  description?: string;
  scheduledBy?: string;
  isManagerEvent: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
