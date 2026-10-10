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

export class OpenAiService implements IAiService {
  public readonly name = 'OpenAI';
  private fallback: MockDeterministicAiService;

  constructor() {
    this.fallback = new MockDeterministicAiService();
  }

  private async callChatCompletion(systemPrompt: string, userPrompt: string): Promise<any> {
    if (!env.OPENAI_API_KEY) {
      logger.warn('OPENAI_API_KEY not configured. Falling back to deterministic AI.');
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `${systemPrompt}\nRespond ONLY with valid JSON.` },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        logger.error(`OpenAI API returned error status: ${response.status}`);
        return null;
      }

      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content;
      return JSON.parse(content);
    } catch (err: any) {
      clearTimeout(timeout);
      logger.error('OpenAI call failed or timed out:', { message: err?.message });
      return null;
    }
  }

  async parseResume(text: string): Promise<ParsedResumeData> {
    const result = await this.callChatCompletion(
      'You are a resume parsing assistant. Extract structured candidate details into JSON matching fields: fullName, email, phone, summary, skills (array of strings), education (array of {degree, institution, year, cgpaOrPercentage}), projects (array of {title, description, technologies}), experience (array of {role, company, duration, description}), certifications (array of {name, issuer, year}).',
      text
    );
    return result || this.fallback.parseResume(text);
  }

  async analyzeResume(parsedData: ParsedResumeData, rawText: string): Promise<ResumeAnalysisResult> {
    const result = await this.callChatCompletion(
      'You are a campus placement resume auditor. Analyze the resume and return JSON with: qualityScore (integer 0-100), summary (string), strengths (array of strings), weaknesses (array of strings), missingInfo (array of strings), recommendations (array of strings).',
      JSON.stringify({ parsedData, sampleText: rawText.slice(0, 3000) })
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
    const result = await this.callChatCompletion(
      'You are a technical recruiter. Match candidate profile against job specifications. Return JSON with: matchScore (integer 0-100), skillBreakdown (array of {skill, status: "MATCHED"|"MISSING"|"PARTIAL", evidence}), missingRequiredSkills (array of strings), recommendations (array of strings).',
      JSON.stringify({ parsedData, jobTitle, jobDescription, requiredSkills, preferredSkills })
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
    const result = await this.callChatCompletion(
      'You are a technical interviewer. Generate targeted interview questions. Return JSON with: questions (array of {questionNumber, category: "TECHNICAL"|"PROJECT_BASED"|"BEHAVIORAL"|"HR", questionText}).',
      JSON.stringify({ targetCompany, targetRole, resumeSummary, skills, count })
    );
    return result || this.fallback.generateMockInterviewQuestions(targetCompany, targetRole, resumeSummary, skills, count);
  }

  async evaluateInterviewAnswer(
    questionText: string,
    category: string,
    studentAnswer: string,
    targetRole: string
  ): Promise<AnswerEvaluationResult> {
    const result = await this.callChatCompletion(
      'Evaluate interview answer. Return JSON with: score (0-10), technicalScore (0-10), problemSolvingScore (0-10), communicationScore (0-10), feedback, strengths (array of strings), improvements (array of strings), modelAnswerOutline.',
      JSON.stringify({ questionText, category, studentAnswer, targetRole })
    );
    return result || this.fallback.evaluateInterviewAnswer(questionText, category, studentAnswer, targetRole);
  }
}
