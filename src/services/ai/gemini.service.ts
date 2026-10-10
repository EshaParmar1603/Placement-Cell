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

export class GeminiService implements IAiService {
  public readonly name = 'Gemini';
  private fallback: MockDeterministicAiService;

  constructor() {
    this.fallback = new MockDeterministicAiService();
  }

  private async callGemini(prompt: string): Promise<any> {
    if (!env.GEMINI_API_KEY) {
      logger.warn('GEMINI_API_KEY not configured. Falling back to deterministic AI.');
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${prompt}\nReturn strictly valid JSON only.` }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        logger.error(`Gemini API returned error status: ${response.status}`);
        return null;
      }

      const data: any = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(content);
    } catch (err: any) {
      clearTimeout(timeout);
      logger.error('Gemini call failed or timed out:', { message: err?.message });
      return null;
    }
  }

  async parseResume(text: string): Promise<ParsedResumeData> {
    const result = await this.callGemini(
      `Parse this candidate resume into JSON with fields: fullName, email, phone, summary, skills (array), education, projects, experience, certifications.\n${text}`
    );
    return result || this.fallback.parseResume(text);
  }

  async analyzeResume(parsedData: ParsedResumeData, rawText: string): Promise<ResumeAnalysisResult> {
    const result = await this.callGemini(
      `Analyze resume quality for campus placements. Return JSON: qualityScore (0-100), summary, strengths, weaknesses, missingInfo, recommendations.\nResume: ${JSON.stringify(parsedData)}`
    );
    return result || this.fallback.analyzeResume(parsedData, rawText);
  }

  async matchResumeToJob(
    parsedData: ParsedResumeData,
    jobTitle: string,
    jobDescription: string,
    requiredSkills: string[],
    preferredSkills: string[]
  ): Promise<JobMatchResult> {
    const result = await this.callGemini(
      `Match resume to job. Return JSON: matchScore (0-100), skillBreakdown, missingRequiredSkills, recommendations.\nJob: ${jobTitle}\nSkills: ${requiredSkills.join(', ')}\nCandidate: ${JSON.stringify(parsedData)}`
    );
    return result || this.fallback.matchResumeToJob(parsedData, jobTitle, jobDescription, requiredSkills, preferredSkills);
  }

  async generateMockInterviewQuestions(
    targetCompany: string,
    targetRole: string,
    resumeSummary: string,
    skills: string[],
    count = 4
  ): Promise<MockInterviewQuestionsResult> {
    const result = await this.callGemini(
      `Generate ${count} mock interview questions for ${targetCompany} ${targetRole}. Return JSON with questions array.\nSkills: ${skills.join(', ')}`
    );
    return result || this.fallback.generateMockInterviewQuestions(targetCompany, targetRole, resumeSummary, skills, count);
  }

  async evaluateInterviewAnswer(
    questionText: string,
    category: string,
    studentAnswer: string,
    targetRole: string
  ): Promise<AnswerEvaluationResult> {
    const result = await this.callGemini(
      `Evaluate interview response. Return JSON with: score, technicalScore, problemSolvingScore, communicationScore, feedback, strengths, improvements, modelAnswerOutline.\nQuestion: ${questionText}\nAnswer: ${studentAnswer}`
    );
    return result || this.fallback.evaluateInterviewAnswer(questionText, category, studentAnswer, targetRole);
  }
}
