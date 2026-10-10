import {
  IAiService,
  ParsedResumeData,
  ResumeAnalysisResult,
  JobMatchResult,
  MockInterviewQuestionsResult,
  AnswerEvaluationResult,
} from './ai.interface.js';

export class MockDeterministicAiService implements IAiService {
  public readonly name = 'MockDeterministicAI';

  async parseResume(text: string): Promise<ParsedResumeData> {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    // Heuristic extraction
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(?:\+91[-\s]?)?[6-9]\d{9}/);
    const cgpaMatch = text.match(/(?:cgpa|gpa)[\s:]*([0-9]+(?:\.[0-9]+)?)/i);

    const knownSkills = [
      'typescript', 'javascript', 'python', 'java', 'c++', 'go', 'rust',
      'react', 'next.js', 'vue', 'angular', 'node.js', 'express', 'spring boot',
      'postgresql', 'mysql', 'mongodb', 'redis', 'prisma',
      'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'git', 'ci/cd',
      'data structures', 'algorithms', 'microservices', 'system design',
      'machine learning', 'deep learning', 'pytorch', 'tensorflow'
    ];

    const lowerText = text.toLowerCase();
    const extractedSkills = knownSkills.filter((skill) => lowerText.includes(skill));

    return {
      fullName: lines[0] || 'Candidate',
      email: emailMatch ? emailMatch[0] : undefined,
      phone: phoneMatch ? phoneMatch[0] : undefined,
      summary: lines.slice(1, 3).join(' '),
      skills: extractedSkills.length > 0 ? extractedSkills : ['Problem Solving', 'Data Structures', 'Communication'],
      education: [
        {
          degree: 'Bachelor of Technology (Computer Science)',
          cgpaOrPercentage: cgpaMatch ? cgpaMatch[1] : '8.5',
          year: 2026,
        },
      ],
      projects: [
        {
          title: 'Campus Management System',
          description: 'Full stack web platform with real-time analytics and authentication',
          technologies: ['TypeScript', 'Node.js', 'PostgreSQL'],
        },
      ],
      experience: [],
      certifications: [],
    };
  }

  async analyzeResume(parsedData: ParsedResumeData, rawText: string): Promise<ResumeAnalysisResult> {
    let score = 50;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const missingInfo: string[] = [];
    const recommendations: string[] = [];

    // Analyze skills
    if (parsedData.skills.length >= 6) {
      score += 20;
      strengths.push(`Diverse technical toolkit identified: ${parsedData.skills.slice(0, 5).join(', ')}`);
    } else {
      weaknesses.push('Limited variety of specific technical skills highlighted');
      recommendations.push('Include 5-8 core domain skills with specific frameworks and databases');
    }

    // Analyze projects
    if (parsedData.projects.length >= 1) {
      score += 15;
      strengths.push('Concrete engineering projects described with relevant technology stacks');
    } else {
      missingInfo.push('Key academic or personal software projects');
      recommendations.push('Add at least two technical projects showcasing end-to-end architecture');
    }

    // Check contact info
    if (parsedData.email && parsedData.phone) {
      score += 10;
      strengths.push('Complete contact information provided');
    } else {
      missingInfo.push('Complete contact credentials (phone or email)');
    }

    // Metric check
    const hasMetrics = /\d+%\s*|\b\d+x\b|\b\d+\s*users\b|\b\d+\s*ms\b/i.test(rawText);
    if (hasMetrics) {
      score += 5;
      strengths.push('Demonstrates quantifiable metrics and measurable performance impact');
    } else {
      weaknesses.push('Project descriptions lack quantifiable impact metrics (e.g., latency reduction, user scale)');
      recommendations.push('Use the Action + Context + Measurable Result formula in bullet points');
    }

    const finalScore = Math.min(Math.max(score, 30), 98);

    return {
      qualityScore: finalScore,
      summary: `The resume demonstrates a ${finalScore >= 75 ? 'strong' : 'moderate'} baseline with clear technical proficiencies in ${parsedData.skills.slice(0, 3).join(', ')}.`,
      strengths,
      weaknesses,
      missingInfo,
      recommendations,
    };
  }

  async matchResumeToJob(
    parsedData: ParsedResumeData,
    _jobTitle: string,
    _jobDescription: string,
    requiredSkills: string[],
    preferredSkills: string[]
  ): Promise<JobMatchResult> {
    const studentSkillsLower = parsedData.skills.map((s) => s.toLowerCase());

    const skillBreakdown: JobMatchResult['skillBreakdown'] = [];
    const missingRequired: string[] = [];
    let matchedRequiredCount = 0;
    let matchedPreferredCount = 0;

    for (const reqSkill of requiredSkills) {
      const match = studentSkillsLower.some((s) => s.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(s));
      if (match) {
        matchedRequiredCount++;
        skillBreakdown.push({
          skill: reqSkill,
          status: 'MATCHED',
          evidence: `Verified in candidate skills or projects`,
        });
      } else {
        missingRequired.push(reqSkill);
        skillBreakdown.push({
          skill: reqSkill,
          status: 'MISSING',
        });
      }
    }

    for (const prefSkill of preferredSkills) {
      const match = studentSkillsLower.some((s) => s.includes(prefSkill.toLowerCase()) || prefSkill.toLowerCase().includes(s));
      if (match) {
        matchedPreferredCount++;
        skillBreakdown.push({
          skill: prefSkill,
          status: 'MATCHED',
          evidence: `Candidate exhibits preferred skill`,
        });
      } else {
        skillBreakdown.push({
          skill: prefSkill,
          status: 'PARTIAL',
          evidence: 'Preferred skill not explicitly highlighted',
        });
      }
    }

    const totalReq = requiredSkills.length || 1;
    const totalPref = preferredSkills.length || 1;

    const reqRatio = matchedRequiredCount / totalReq;
    const prefRatio = matchedPreferredCount / totalPref;

    // Weight required skills at 75%, preferred at 25%
    const calculatedScore = Math.round((reqRatio * 75) + (prefRatio * 25));
    const matchScore = Math.min(Math.max(calculatedScore, 20), 100);

    const recommendations: string[] = [];
    if (missingRequired.length > 0) {
      recommendations.push(`Priority preparation: Acquire or highlight foundational competency in ${missingRequired.join(', ')}`);
    } else {
      recommendations.push('Excellent core skill alignment! Focus on deep-dive system design and behavioral interview practice.');
    }

    return {
      matchScore,
      skillBreakdown,
      missingRequiredSkills: missingRequired,
      recommendations,
    };
  }

  async generateMockInterviewQuestions(
    targetCompany: string,
    targetRole: string,
    resumeSummary: string,
    skills: string[],
    count = 4
  ): Promise<MockInterviewQuestionsResult> {
    const topSkills = skills.slice(0, 3).join(' and ') || 'Computer Science fundamentals';

    const defaultQuestions: MockInterviewQuestionsResult['questions'] = [
      {
        questionNumber: 1,
        category: 'TECHNICAL',
        questionText: `Given your background with ${topSkills}, how would you architect a fault-tolerant caching layer for high-throughput APIs at ${targetCompany}?`,
      },
      {
        questionNumber: 2,
        category: 'PROJECT_BASED',
        questionText: `Walk me through the most technically challenging project on your resume. What key trade-offs did you evaluate regarding data consistency and performance?`,
      },
      {
        questionNumber: 3,
        category: 'BEHAVIORAL',
        questionText: `Tell me about a time when you discovered a critical bug right before a major academic or project submission. How did you triage and resolve it?`,
      },
      {
        questionNumber: 4,
        category: 'HR',
        questionText: `Why are you specifically interested in the ${targetRole} position at ${targetCompany}, and what strengths differentiate your engineering approach?`,
      },
    ];

    return {
      questions: defaultQuestions.slice(0, count),
    };
  }

  async evaluateInterviewAnswer(
    questionText: string,
    category: string,
    studentAnswer: string,
    targetRole: string
  ): Promise<AnswerEvaluationResult> {
    const wordCount = studentAnswer.trim().split(/\s+/).length;
    let score = 5;

    // Length and depth heuristics
    if (wordCount > 30) score += 2;
    if (wordCount > 80) score += 2;

    const technicalKeywords = ['latency', 'throughput', 'architecture', 'cache', 'database', 'complexity', 'o(n)', 'trade-off', 'index'];
    const matchedKeywords = technicalKeywords.filter((k) => studentAnswer.toLowerCase().includes(k));

    if (matchedKeywords.length >= 2) score += 1;

    const finalScore = Math.min(Math.max(score, 3), 10);

    return {
      score: finalScore,
      technicalScore: Math.min(finalScore, 10),
      problemSolvingScore: Math.min(finalScore + 1, 10),
      communicationScore: wordCount >= 40 ? 9 : 6,
      feedback: `Candidate provided a ${finalScore >= 7 ? 'thorough and structured' : 'basic'} response addressing the core prompt for ${targetRole}.`,
      strengths: [
        'Clear articulation of core concepts',
        'Directly addressed the technical constraints described',
      ],
      improvements: [
        'Provide concrete edge-case analysis or benchmarking numbers',
        'Elaborate on recovery strategies when failure cascades occur',
      ],
      modelAnswerOutline: `A strong answer covers: 1. Core requirement clarification, 2. Architectural components and data flow, 3. Trade-offs (latency vs consistency), and 4. Failure modes and monitoring.`,
    };
  }
}
