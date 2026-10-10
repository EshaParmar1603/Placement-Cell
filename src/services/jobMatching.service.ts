import { prisma } from '../config/database.js';
import { getAiService } from './ai/ai.factory.js';
import { ParsedResumeData } from './ai/ai.interface.js';
import { NotFoundError } from '../utils/appError.js';

export class JobMatchingService {
  async evaluateMatch(studentId: string, opportunityId: string, resumeId?: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundError('Student profile not found');

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { company: true },
    });
    if (!opportunity) throw new NotFoundError('Opportunity not found');

    // Find requested resume, or latest resume
    let targetResume = null;
    if (resumeId) {
      targetResume = await prisma.resume.findUnique({ where: { id: resumeId } });
    } else {
      targetResume = await prisma.resume.findFirst({
        where: { studentId: student.id },
        orderBy: { version: 'desc' },
      });
    }

    // 1. Evaluate Official Academic Eligibility
    const academicChecks = {
      cgpaStatus: 'PASS',
      cgpaMessage: `Student CGPA (${student.cgpa}) meets minimum requirement (${opportunity.minCgpa})`,
      backlogsStatus: 'PASS',
      backlogsMessage: `Active backlogs (${student.activeBacklogs}) within allowed limit (${opportunity.maxBacklogsAllowed})`,
      departmentStatus: 'PASS',
      departmentMessage: `Department '${student.department}' is eligible`,
      graduationYearStatus: 'PASS',
      graduationYearMessage: `Graduation year (${student.graduationYear}) is eligible`,
    };

    let isAcademicEligible = true;
    let isUnknown = false;

    if (student.cgpa === null || student.cgpa === undefined || student.cgpa === 0) {
      academicChecks.cgpaStatus = 'UNKNOWN';
      academicChecks.cgpaMessage = 'CGPA information is missing from student profile';
      isUnknown = true;
    } else if (student.cgpa < opportunity.minCgpa) {
      academicChecks.cgpaStatus = 'FAIL';
      academicChecks.cgpaMessage = `Student CGPA (${student.cgpa}) is below minimum requirement (${opportunity.minCgpa})`;
      isAcademicEligible = false;
    }

    if (student.activeBacklogs > opportunity.maxBacklogsAllowed) {
      academicChecks.backlogsStatus = 'FAIL';
      academicChecks.backlogsMessage = `Active backlogs (${student.activeBacklogs}) exceed maximum allowed (${opportunity.maxBacklogsAllowed})`;
      isAcademicEligible = false;
    }

    if (
      opportunity.allowedDepartments.length > 0 &&
      !opportunity.allowedDepartments.includes(student.department)
    ) {
      academicChecks.departmentStatus = 'FAIL';
      academicChecks.departmentMessage = `Department '${student.department}' is not in allowed list (${opportunity.allowedDepartments.join(', ')})`;
      isAcademicEligible = false;
    }

    if (
      opportunity.allowedGraduationYears.length > 0 &&
      !opportunity.allowedGraduationYears.includes(student.graduationYear)
    ) {
      academicChecks.graduationYearStatus = 'FAIL';
      academicChecks.graduationYearMessage = `Graduation batch (${student.graduationYear}) is not in allowed years (${opportunity.allowedGraduationYears.join(', ')})`;
      isAcademicEligible = false;
    }

    const officialEligibilityStatus = isUnknown ? 'UNKNOWN' : isAcademicEligible ? 'ELIGIBLE' : 'INELIGIBLE';

    // 2. Evaluate Resume Match Score via AI engine
    const ai = getAiService();
    const parsedData: ParsedResumeData = (targetResume?.parsedData as any) || {
      skills: student.skills,
      education: [{ degree: student.course, cgpaOrPercentage: student.cgpa.toString() }],
      projects: [],
      experience: [],
      certifications: [],
    };

    const aiMatchResult = await ai.matchResumeToJob(
      parsedData,
      opportunity.title,
      opportunity.description,
      opportunity.requiredSkills,
      opportunity.preferredSkills
    );

    // 3. Save Match Report record
    const matchReport = await prisma.jobMatchReport.upsert({
      where: {
        studentId_opportunityId: {
          studentId: student.id,
          opportunityId: opportunity.id,
        },
      },
      update: {
        resumeId: targetResume?.id || null,
        matchScore: aiMatchResult.matchScore,
        academicEligibility: officialEligibilityStatus,
        skillBreakdown: aiMatchResult.skillBreakdown as any,
        missingRequiredSkills: aiMatchResult.missingRequiredSkills,
        recommendations: aiMatchResult.recommendations as any,
      },
      create: {
        studentId: student.id,
        opportunityId: opportunity.id,
        resumeId: targetResume?.id || null,
        matchScore: aiMatchResult.matchScore,
        academicEligibility: officialEligibilityStatus,
        skillBreakdown: aiMatchResult.skillBreakdown as any,
        missingRequiredSkills: aiMatchResult.missingRequiredSkills,
        recommendations: aiMatchResult.recommendations as any,
      },
    });

    return {
      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        company: opportunity.company.name,
      },
      resumeEvaluated: targetResume
        ? { id: targetResume.id, version: targetResume.version, originalName: targetResume.originalName }
        : null,
      officialEligibility: {
        status: officialEligibilityStatus,
        checks: academicChecks,
      },
      resumeMatch: {
        score: aiMatchResult.matchScore,
        skillBreakdown: aiMatchResult.skillBreakdown,
        missingRequiredSkills: aiMatchResult.missingRequiredSkills,
        recommendations: aiMatchResult.recommendations,
        disclaimer:
          'This score reflects resume semantic alignment with stated job requirements and is not a guarantee of selection.',
      },
      reportId: matchReport.id,
    };
  }
}

export const jobMatchingService = new JobMatchingService();
