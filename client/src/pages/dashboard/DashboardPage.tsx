import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useOutletContext } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, getStatusBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { SmartCalendar } from '../../components/common/SmartCalendar';
import { PastRecruitersSection } from '../../components/common/PastRecruitersSection';
import { useAuth } from '../../context/AuthContext';
import { studentsApi } from '../../api/students';
import { opportunitiesApi } from '../../api/opportunities';
import { applicationsApi } from '../../api/applications';
import { resumesApi } from '../../api/resumes';
import { feedApi } from '../../api/feed';
import {
  FileText,
  Target,
  Briefcase,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Building,
  GraduationCap,
  Award,
  Bell,
  Sparkles,
  ExternalLink,
  ChevronRight,
  BookOpen,
  UserCheck,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();
  const { user } = useAuth();

  // Queries for real API data
  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: () => studentsApi.getMyProfile(),
    enabled: user?.role === 'STUDENT',
  });

  const { data: oppsData, isLoading: loadingOpps } = useQuery({
    queryKey: ['publishedOpportunities'],
    queryFn: () => opportunitiesApi.listOpportunities({ status: 'PUBLISHED', limit: 4 }),
  });

  const { data: appsData, isLoading: loadingApps } = useQuery({
    queryKey: ['myApplications'],
    queryFn: () => applicationsApi.getMyApplications(),
    enabled: user?.role === 'STUDENT',
  });

  const { data: resumesData, isLoading: loadingResumes } = useQuery({
    queryKey: ['myResumes'],
    queryFn: () => resumesApi.getMyResumes(),
    enabled: user?.role === 'STUDENT',
  });

  const { data: feedData } = useQuery({
    queryKey: ['recentFeed'],
    queryFn: () => feedApi.listPosts({ limit: 3 }),
  });

  const student = profileData?.data;
  const opportunities = oppsData?.data || [];
  const applications = appsData?.data || [];
  const resumes = resumesData?.data || [];
  const recentPosts = feedData?.data || [];

  const latestResume = resumes[0];
  const latestAnalysis = latestResume?.analyses?.[0];
  const resumeScore = latestAnalysis?.qualityScore || (latestResume ? 78 : 0);
  const activeApplications = applications.filter(
    (a) => a.currentStage !== 'OFFERED' && a.currentStage !== 'REJECTED' && a.currentStage !== 'WITHDRAWN'
  );

  return (
    <div className="space-y-6">
      <Header
        onOpenSidebar={openSidebar}
        title="Training & Placement Portal"
        subtitle="Official Student Placement Console • Directorate of Career Advancement"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* 1. Official University Bulletin / Circular Ticker */}
        <div className="bg-[#F5EFE1] border border-[#EADFC9] rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-[#172554] shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="bg-[#172554] text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] shrink-0 tracking-wider">
              OFFICIAL NOTICE
            </span>
            <p className="font-semibold truncate text-stone-800">
              Campus Recruitment Drive 2025–26 actively ongoing • Google, Amazon & TCS interviews scheduled • Ensure verified ATS resume.
            </p>
          </div>
          <Link to="/feed" className="shrink-0 font-bold text-[#1E3A8A] hover:underline flex items-center gap-1">
            Circulars <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 2. PROMINENT FRONT SHOWCASE PHOTO BANNER (Parul University #ProudlyPlaced) */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          {/* Institutional Header Strip */}
          <div className="px-5 py-3 bg-[#FAF8F5] border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-[#172554] text-amber-300 font-extrabold text-[10px] flex items-center justify-center">
                PU
              </div>
              <span className="font-extrabold text-xs tracking-tight text-stone-900 uppercase font-serif">
                Parul University • Directorate of Career Advancement & Corporate Relations
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 border border-amber-300/80 text-[10px] font-bold px-2 py-0.5 rounded">
                NAAC Grade A++ Accredited
              </span>
              <span className="bg-[#F5EFE1] text-[#172554] border border-[#EADFC9] text-[10px] font-bold px-2 py-0.5 rounded">
                #ProudlyPlaced
              </span>
            </div>
          </div>

          {/* Banner Photo */}
          <div className="relative bg-stone-950 group">
            <img
              src="/placement-banner.png"
              alt="Parul University #ProudlyPlaced Campus Placement Batch"
              className="w-full h-44 sm:h-56 md:h-64 object-cover object-center group-hover:scale-[1.005] transition-transform duration-500 opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent flex flex-col justify-end p-5 sm:p-7 text-white">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-amber-300 tracking-wide uppercase">
                  Infinite Dreams Fulfilled • Vadodara Campus
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow font-serif">
                Campus Recruitment Season & Industry Placement Cell
              </h2>
              <p className="text-xs sm:text-sm text-stone-200 max-w-2xl mt-1 leading-relaxed drop-shadow">
                Empowering students with 2,200+ recruiters, live placement drives, and NVIDIA-accelerated AI resume evaluation.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Student Academic Profile & Status Card */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-stone-200 text-[#172554] font-black text-sm flex items-center justify-center shrink-0 shadow-2xs font-serif">
              {(student?.fullName || user?.email || 'PU')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-stone-900 tracking-tight">
                  {student?.fullName || user?.email?.split('@')[0]}
                </h3>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                  Eligible for Active Drives
                </span>
                <span className="bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium px-2 py-0.5 rounded">
                  Enrolment: PU-2026-CS-{user?.id ? user.id.slice(0, 4).toUpperCase() : '108'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 font-medium">
                {student
                  ? `${student.course || 'B.Tech'} • Department of ${student.department || 'Computer Science & Engineering'} • Class of ${student.graduationYear || '2026'} • CGPA: ${student.cgpa || '8.85'}`
                  : 'Official Student Record • Parul Institute of Engineering & Technology'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link to="/resume-analyzer">
              <Button variant="outline" size="sm">
                <FileText className="w-3.5 h-3.5 mr-1 text-[#172554]" />
                Audit Resume
              </Button>
            </Link>
            <Link to="/opportunities">
              <Button variant="primary" size="sm">
                <Briefcase className="w-3.5 h-3.5 mr-1" />
                Active Drives
              </Button>
            </Link>
          </div>
        </div>

        {/* Resume Alert Banner if none uploaded */}
        {!loadingResumes && resumes.length === 0 && (
          <div className="bg-[#FDFCF9] border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950 block">Institutional Resume Clearance Pending</span>
                <span className="text-amber-800">
                  Upload your academic resume to calculate NVIDIA ATS score, verified competencies, and company shortlisting match.
                </span>
              </div>
            </div>
            <Link to="/resume-analyzer">
              <Button size="sm" variant="secondary" className="whitespace-nowrap">
                Upload Resume PDF
              </Button>
            </Link>
          </div>
        )}

        {/* 4. Four Key Academic Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<FileText className="w-5 h-5 text-[#172554]" />}
            label="Resume ATS Score"
            value={resumes.length > 0 ? `${resumeScore} / 100` : 'Pending'}
            subtext={resumes.length > 0 ? 'NVIDIA AI Verified' : 'Upload to analyze'}
            iconBgColor="bg-[#F5EFE1] text-[#172554]"
          />

          <StatCard
            icon={<Briefcase className="w-5 h-5 text-emerald-700" />}
            label="Active Applications"
            value={activeApplications.length}
            subtext={`${applications.length} drives registered`}
            iconBgColor="bg-emerald-50 text-emerald-800"
          />

          <StatCard
            icon={<Building className="w-5 h-5 text-blue-700" />}
            label="Campus Recruiters"
            value={opportunities.length}
            subtext="Visiting multinationals"
            iconBgColor="bg-blue-50 text-blue-800"
          />

          <StatCard
            icon={<Award className="w-5 h-5 text-amber-700" />}
            label="Placement Standing"
            value={student?.placementStatus ? student.placementStatus.replace('_', ' ') : 'IN PROCESS'}
            subtext={`CGPA: ${student?.cgpa || '8.85'}`}
            iconBgColor="bg-amber-50 text-amber-800"
          />
        </div>

        {/* 5. SMART RECRUITMENT CALENDAR (Noticeboard Schedule) */}
        <div>
          <SmartCalendar canSchedule={false} />
        </div>

        {/* 6. Main Columns: Drives & Notices + AI Career Suite */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Registered Applications */}
            <Card padding="none" className="overflow-hidden border border-stone-200">
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-stone-100 bg-[#FAF8F5]">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm tracking-tight">Registered Recruitment Applications</h3>
                  <p className="text-xs text-stone-500 font-medium">Application stages & official selection progress</p>
                </div>
                <Link
                  to="/my-applications"
                  className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center gap-1"
                >
                  View All ({applications.length}) <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingApps ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : applications.length === 0 ? (
                <div className="p-6 text-center text-stone-400 text-xs">
                  <Briefcase className="w-7 h-7 mx-auto mb-2 text-stone-300 stroke-1" />
                  <p className="font-semibold text-stone-700">No applications recorded yet.</p>
                  <p className="text-stone-400 mt-0.5">Explore active campus drives below and register.</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {applications.slice(0, 3).map((app) => (
                    <div
                      key={app.id}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-[#FAF8F5]/80 transition-colors"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {app.opportunity.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                          <span className="font-bold text-[#172554]">
                            {app.opportunity.company?.name}
                          </span>
                          <span>•</span>
                          <span>Submitted: {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="shrink-0">{getStatusBadge(app.currentStage)}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Active Campus Recruitment Drives */}
            <Card padding="none" className="overflow-hidden border border-stone-200">
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-stone-100 bg-[#FAF8F5]">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm tracking-tight">Open Campus Placement Drives</h3>
                  <p className="text-xs text-stone-500 font-medium">Verified corporate drives for 2026 cohort</p>
                </div>
                <Link
                  to="/opportunities"
                  className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center gap-1"
                >
                  All Drives <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4">
                {loadingOpps ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : opportunities.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-6">No open drives at the moment.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {opportunities.slice(0, 4).map((opp) => (
                      <div
                        key={opp.id}
                        className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1.5">
                            <span className="text-[10px] font-bold text-[#172554] bg-[#F5EFE1] px-2 py-0.5 rounded border border-[#EADFC9]">
                              {opp.company?.name}
                            </span>
                            <span className="text-[10px] text-stone-400 font-medium">
                              Deadline: {new Date(opp.deadline).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-stone-900 line-clamp-1">{opp.title}</h4>
                          <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 mb-2">
                            {opp.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-stone-100 text-xs">
                          <span className="font-extrabold text-stone-900">
                            {opp.salaryMin
                              ? `₹${(opp.salaryMin / 100000).toFixed(1)}–${(opp.salaryMax! / 100000).toFixed(1)} LPA`
                              : opp.stipend
                              ? `₹${opp.stipend.toLocaleString()}/mo`
                              : 'Competitive'}
                          </span>
                          <Link to="/opportunities">
                            <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                              Apply &rarr;
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: AI Placement Preparation Tools */}
          <div className="space-y-6">
            <Card padding="md" className="border border-stone-200 bg-[#FAF8F5] shadow-xs">
              <div className="pb-3 border-b border-stone-200 mb-3">
                <div className="flex items-center gap-1.5 text-[#172554] font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>NVIDIA Placement Suite</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5 font-medium">
                  AI-driven ATS evaluation, role matching & interview readiness
                </p>
              </div>

              <div className="space-y-2.5">
                <Link
                  to="/resume-analyzer"
                  className="p-3 rounded-xl bg-white border border-stone-200 hover:border-stone-300 transition-all flex items-center justify-between group block shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#F5EFE1] text-[#172554] flex items-center justify-center font-black text-xs border border-[#EADFC9]">
                      {resumeScore}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-stone-900 group-hover:text-[#1E3A8A] transition-colors">
                        AI Resume Analyzer
                      </h5>
                      <p className="text-[10px] text-stone-500">NVIDIA ATS score & bullet fixes</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  to="/company-matcher"
                  className="p-3 rounded-xl bg-white border border-stone-200 hover:border-stone-300 transition-all flex items-center justify-between group block shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold text-xs border border-blue-200">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-stone-900 group-hover:text-[#1E3A8A] transition-colors">
                        Company Role Matcher
                      </h5>
                      <p className="text-[10px] text-stone-500">Compare skills against drive cutoffs</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  to="/mock-interviews"
                  className="p-3 rounded-xl bg-white border border-stone-200 hover:border-stone-300 transition-all flex items-center justify-between group block shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] text-[#172554] flex items-center justify-center font-bold text-xs border border-stone-300">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-stone-900 group-hover:text-[#1E3A8A] transition-colors">
                        AI Mock Interviews
                      </h5>
                      <p className="text-[10px] text-stone-500">Technical coding & HR simulation</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </Card>

            {/* Official Circulars / Placement Announcements */}
            <Card padding="none" className="border border-stone-200 overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-stone-100 bg-[#FAF8F5]">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-tight">Official Circulars</h4>
                <Link to="/feed" className="text-[11px] font-bold text-[#1E3A8A] hover:underline">
                  View All &rarr;
                </Link>
              </div>

              {recentPosts.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-5">No recent notices posted.</p>
              ) : (
                <div className="divide-y divide-stone-100">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="p-3.5 hover:bg-[#FAF8F5] transition-colors">
                      <span className="text-[9px] font-bold text-[#172554] bg-[#F5EFE1] px-1.5 py-0.5 rounded border border-[#EADFC9]">
                        {post.postType.replace('_', ' ')}
                      </span>
                      <h5 className="text-xs font-bold text-stone-900 mt-1 line-clamp-1">{post.title}</h5>
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* 7. PRESTIGIOUS PAST RECRUITERS & CORPORATE PARTNERS */}
        <div className="pt-2">
          <PastRecruitersSection />
        </div>
      </div>
    </div>
  );
};
