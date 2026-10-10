import { prisma } from '../config/database.js';
import { OpportunityStatus, PlacementStatus, ApplicationStage, BookingStatus } from '@prisma/client';

export class AnalyticsService {
  async getOverviewMetrics() {
    const [
      totalRegisteredStudents,
      studentsPlaced,
      totalPublishedOpportunities,
      totalClosedOpportunities,
      totalApplications,
      uniqueApplicantsGroup,
      totalMentorBookings,
      completedMentorBookings,
      totalResumesAnalyzed,
      totalMockSessionsCompleted,
    ] = await Promise.all([
      // Total registered students
      prisma.studentProfile.count(),
      // Students placed
      prisma.studentProfile.count({ where: { placementStatus: PlacementStatus.PLACED } }),
      // Published opportunities
      prisma.opportunity.count({ where: { status: OpportunityStatus.PUBLISHED } }),
      // Closed opportunities
      prisma.opportunity.count({ where: { status: OpportunityStatus.CLOSED } }),
      // Total applications
      prisma.application.count(),
      // Unique students who applied
      prisma.application.groupBy({
        by: ['studentId'],
      }),
      // Total mentor bookings
      prisma.mentorBooking.count(),
      // Completed mentor bookings
      prisma.mentorBooking.count({ where: { status: BookingStatus.COMPLETED } }),
      // Resumes analyzed
      prisma.resumeAnalysis.count(),
      // Mock interview sessions completed
      prisma.mockInterviewSession.count({ where: { status: 'COMPLETED' } }),
    ]);

    const uniqueStudentsApplied = uniqueApplicantsGroup.length;
    const placementRate = totalRegisteredStudents > 0
      ? Math.round((studentsPlaced / totalRegisteredStudents) * 100)
      : 0;

    return {
      students: {
        totalRegistered: totalRegisteredStudents,
        placedCount: studentsPlaced,
        placementRatePercentage: placementRate,
      },
      opportunities: {
        published: totalPublishedOpportunities,
        closed: totalClosedOpportunities,
        totalActiveOrPast: totalPublishedOpportunities + totalClosedOpportunities,
      },
      applications: {
        totalSubmitted: totalApplications,
        uniqueStudentsApplied,
      },
      mentorship: {
        totalBooked: totalMentorBookings,
        completed: completedMentorBookings,
      },
      preparationActivity: {
        resumesAnalyzed: totalResumesAnalyzed,
        mockInterviewsCompleted: totalMockSessionsCompleted,
      },
    };
  }

  async getDepartmentAndPlacementBreakdown() {
    const [departmentCounts, placementStatusCounts, graduationYearCounts] = await Promise.all([
      prisma.studentProfile.groupBy({
        by: ['department'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.studentProfile.groupBy({
        by: ['placementStatus'],
        _count: { id: true },
      }),
      prisma.studentProfile.groupBy({
        by: ['graduationYear'],
        _count: { id: true },
        orderBy: { graduationYear: 'asc' },
      }),
    ]);

    return {
      byDepartment: departmentCounts.map((d) => ({
        department: d.department,
        count: d._count.id,
      })),
      byPlacementStatus: placementStatusCounts.map((p) => ({
        status: p.placementStatus,
        count: p._count.id,
      })),
      byGraduationYear: graduationYearCounts.map((y) => ({
        graduationYear: y.graduationYear,
        count: y._count.id,
      })),
    };
  }

  async getApplicationFunnel(opportunityId?: string) {
    const where = opportunityId ? { opportunityId } : {};

    const stageBreakdown = await prisma.application.groupBy({
      by: ['currentStage'],
      where,
      _count: { id: true },
    });

    const stagesOrdered: ApplicationStage[] = [
      ApplicationStage.APPLIED,
      ApplicationStage.SHORTLISTED,
      ApplicationStage.ASSESSMENT,
      ApplicationStage.TECHNICAL_INTERVIEW,
      ApplicationStage.HR_INTERVIEW,
      ApplicationStage.OFFERED,
      ApplicationStage.REJECTED,
      ApplicationStage.WITHDRAWN,
    ];

    const countsMap = new Map<ApplicationStage, number>();
    stageBreakdown.forEach((s) => countsMap.set(s.currentStage, s._count.id));

    return stagesOrdered.map((stage) => ({
      stage,
      count: countsMap.get(stage) || 0,
    }));
  }

  async getOpportunityEligibilityAndNonApplicants(opportunityId: string) {
    const opp = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { company: true },
    });

    if (!opp) return null;

    // 1. Get eligible student population
    const eligibleStudents = await prisma.studentProfile.findMany({
      where: {
        cgpa: { gte: opp.minCgpa },
        activeBacklogs: { lte: opp.maxBacklogsAllowed },
        ...(opp.allowedDepartments.length > 0 && {
          department: { in: opp.allowedDepartments },
        }),
        ...(opp.allowedGraduationYears.length > 0 && {
          graduationYear: { in: opp.allowedGraduationYears },
        }),
      },
      select: {
        id: true,
        fullName: true,
        enrollmentNumber: true,
        department: true,
        graduationYear: true,
        cgpa: true,
      },
    });

    // 2. Get students who have applied to this opportunity
    const appliedApplications = await prisma.application.findMany({
      where: { opportunityId },
      select: { studentId: true },
    });
    const appliedStudentIds = new Set(appliedApplications.map((a) => a.studentId));

    const eligibleApplied: any[] = [];
    const eligibleNotApplied: any[] = [];

    for (const student of eligibleStudents) {
      if (appliedStudentIds.has(student.id)) {
        eligibleApplied.push(student);
      } else {
        eligibleNotApplied.push(student);
      }
    }

    return {
      opportunity: { id: opp.id, title: opp.title, company: opp.company.name },
      summary: {
        totalEligiblePopulation: eligibleStudents.length,
        eligibleStudentsAppliedCount: eligibleApplied.length,
        eligibleStudentsNotAppliedCount: eligibleNotApplied.length,
        eligibleApplicationRate:
          eligibleStudents.length > 0
            ? Math.round((eligibleApplied.length / eligibleStudents.length) * 100)
            : 0,
      },
      nonApplicants: eligibleNotApplied,
    };
  }
}

export const analyticsService = new AnalyticsService();
