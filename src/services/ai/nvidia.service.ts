import {
  IAiService,
  ParsedResumeData,
  ResumeAnalysisResult,
  JobMatchResult,
  MockInterviewQuestionsResult,
  AnswerEvaluationResult,
} from './ai.interface.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { MockDeterministicAiService } from './mockDeterministicAi.service.js';

export class NvidiaService implements IAiService {
  public readonly name = 'NVIDIA NIM';
  private fallback: MockDeterministicAiService;
  private endpoint = 'https://integrate.api.nvidia.com/v1/chat/completions';

  constructor() {
    this.fallback = new MockDeterministicAiService();
  }

  private async callNvidiaCompletion(systemPrompt: string, userPrompt: string): Promise<any> {
    if (!env.NVIDIA_API_KEY) {
      logger.info('NVIDIA_API_KEY not configured. Running high-precision local analysis.');
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      logger.info(`Invoking NVIDIA NIM API using model ${env.NVIDIA_MODEL}`);
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.NVIDIA_MODEL,
          messages: [
            {
              role: 'system',
              content: `${systemPrompt}\nOutput MUST be valid, well-formed JSON only. Do not wrap in markdown quotes if possible, or provide raw json object.`,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 2048,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        logger.error(`NVIDIA API responded with error status: ${response.status}`);
        return null;
      }

      const data: any = await response.json();
      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) return null;

      // Extract JSON if wrapped in codeblocks
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return JSON.parse(rawContent);
    } catch (err: any) {
      clearTimeout(timeout);
      logger.warn('NVIDIA NIM API call failed or timed out:', { message: err?.message });
      return null;
    }
  }

  async parseResume(text: string): Promise<ParsedResumeData> {
    const systemPrompt = `You are an expert AI Resume Parser for university placement cells.
Extract structured candidate details into JSON matching:
{
  "fullName": string,
  "email": string,
  "phone": string,
  "summary": string,
  "skills": string[],
  "education": [{"degree": string, "institution": string, "year": number, "cgpaOrPercentage": string}],
  "projects": [{"title": string, "description": string, "technologies": string[]}],
  "experience": [{"role": string, "company": string, "duration": string, "description": string}],
  "certifications": [{"name": string, "issuer": string, "year": number}]
}`;

    const result = await this.callNvidiaCompletion(systemPrompt, `Candidate Resume Text:\n${text}`);
    return result || this.fallback.parseResume(text);
  }

  async analyzeResume(parsedData: ParsedResumeData, rawText: string): Promise<ResumeAnalysisResult> {
    const systemPrompt = `You are a Senior Technical Placement Officer and ATS Auditor using NVIDIA accelerated intelligence.
Analyze the candidate resume against current industry hiring benchmarks.
Produce a comprehensive JSON response matching:
{
  "qualityScore": number (integer 0-100 reflecting ATS readability, metrics in bullets, skill breadth),
  "summary": string (thorough 2-3 sentence assessment of candidate placement readiness),
  "strengths": string[] (3-5 concrete strengths found in projects, education, or skills),
  "weaknesses": string[] (3-5 areas of improvement such as lack of quantifiable metrics or missing technologies),
  "missingInfo": string[] (essential sections or links missing, e.g. GitHub, LinkedIn, live demo links),
  "recommendations": string[] (actionable, step-by-step guidance to boost candidate shortlisting probability)
}`;

    const userPrompt = JSON.stringify({
      parsedData,
      rawTextSnippet: rawText.slice(0, 4000),
    });

    const result = await this.callNvidiaCompletion(systemPrompt, userPrompt);
    return result || this.fallback.analyzeResume(parsedData, rawText);
  }

  async matchResumeToJob(
    parsedData: ParsedResumeData,
    jobTitle: string,
    jobDescription: string,
    requiredSkills: string[],
    preferredSkills: string[]
  ): Promise<JobMatchResult> {
    const systemPrompt = `You are an elite Corporate Recruiter evaluating a student resume against a company placement opening.
Evaluate exact technical and project alignment. Return a JSON object with:
{
  "matchScore": number (0-100 percentage based on requirement coverage and evidence),
  "skillBreakdown": [
    {
      "skill": string,
      "status": "MATCHED" | "MISSING" | "PARTIAL",
      "evidence": string (quote or cite specific project/experience evidence from candidate resume, or explain what is missing)
    }
  ],
  "missingRequiredSkills": string[] (mandatory skills not evidenced in resume),
  "recommendations": string[] (tailored advice for succeeding in this company's interview rounds)
}`;

    const userPrompt = JSON.stringify({
      targetJob: {
        jobTitle,
        jobDescription,
        requiredSkills,
        preferredSkills,
      },
      candidateProfile: {
        skills: parsedData.skills,
        projects: parsedData.projects,
        experience: parsedData.experience,
        education: parsedData.education,
      },
    });

    const result = await this.callNvidiaCompletion(systemPrompt, userPrompt);
    return result || this.fallback.matchResumeToJob(parsedData, jobTitle, jobDescription, requiredSkills, preferredSkills);
  }

  async generateMockInterviewQuestions(
    targetCompany: string,
    targetRole: string,
    resumeSummary: string,
    skills: string[],
    count = 4
  ): Promise<MockInterviewQuestionsResult> {
    const systemPrompt = `You are a lead technical interviewer at ${targetCompany}. Generate ${count} real interview questions tailored to the candidate's skills and ${targetRole}. Return JSON with:
{
  "questions": [
    {
      "questionNumber": number,
      "category": "TECHNICAL" | "PROJECT_BASED" | "BEHAVIORAL" | "HR",
      "questionText": string
    }
  ]
}`;

    const userPrompt = JSON.stringify({ targetCompany, targetRole, resumeSummary, skills, count });
    const result = await this.callNvidiaCompletion(systemPrompt, userPrompt);
    return result || this.fallback.generateMockInterviewQuestions(targetCompany, targetRole, resumeSummary, skills, count);
  }

  async evaluateInterviewAnswer(
    questionText: string,
    category: string,
    studentAnswer: string,
    targetRole: string
  ): Promise<AnswerEvaluationResult> {
    const systemPrompt = `You are an interview panelist evaluating a student's interview response for ${targetRole}. Return JSON with:
{
  "score": number (1-10 overall),
  "technicalScore": number (0-100),
  "problemSolvingScore": number (0-100),
  "communicationScore": number (0-100),
  "feedback": string,
  "strengths": string[],
  "improvements": string[],
  "modelAnswerOutline": string
}`;

    const userPrompt = JSON.stringify({ questionText, category, studentAnswer, targetRole });
    const result = await this.callNvidiaCompletion(systemPrompt, userPrompt);
    return result || this.fallback.evaluateInterviewAnswer(questionText, category, studentAnswer, targetRole);
  }
}
