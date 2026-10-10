import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useOutletContext } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, getStatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton, CardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { opportunitiesApi } from '../../api/opportunities';
import { applicationsApi } from '../../api/applications';
import { matchingApi } from '../../api/matching';
import { resumesApi } from '../../api/resumes';
import { useAuth } from '../../context/AuthContext';
import { Opportunity, JobMatchReport, Resume } from '../../types';
import {
  Search,
  Filter,
  Briefcase,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [employmentType, setEmploymentType] = useState('');

  // Selected Opportunity for Eligibility Modal
  const [matchingOpp, setMatchingOpp] = useState<Opportunity | null>(null);
  const [matchReport, setMatchReport] = useState<JobMatchReport | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  // Selected Opportunity for Apply Modal
  const [applyingOpp, setApplyingOpp] = useState<Opportunity | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [applicationNotes, setApplicationNotes] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  // Queries
  const { data: oppsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['opportunitiesList', search, department, employmentType],
    queryFn: () =>
      opportunitiesApi.listOpportunities({
        search: search || undefined,
        department: department || undefined,
        employmentType: employmentType || undefined,
        status: user?.role === 'STUDENT' ? 'PUBLISHED' : undefined,
      }),
  });

  const { data: resumesData } = useQuery({
    queryKey: ['myResumesForApply'],
    queryFn: () => resumesApi.getMyResumes(),
    enabled: !!applyingOpp || !!matchingOpp,
  });

  const { data: myAppsData } = useQuery({
    queryKey: ['myApplicationsLookup'],
    queryFn: () => applicationsApi.getMyApplications(),
    enabled: user?.role === 'STUDENT',
  });

  const opportunities = oppsData?.data || [];
  const resumes = resumesData?.data || [];
  const appliedOppIds = new Set((myAppsData?.data || []).map((a) => a.opportunityId));

  // Check Eligibility Handler
  const handleCheckEligibility = async (opp: Opportunity) => {
    setMatchingOpp(opp);
    setLoadingMatch(true);
    setMatchReport(null);
    try {
      const res = await matchingApi.evaluateMatch(opp.id);
      if (res.success) {
        setMatchReport(res.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingMatch(false);
    }
  };

  // Apply Mutation
  const applyMutation = useMutation({
    mutationFn: (data: { opportunityId: string; resumeId: string; notes?: string }) =>
      applicationsApi.apply(data),
    onSuccess: () => {
      setApplySuccess(true);
      queryClient.invalidateQueries({ queryKey: ['myApplicationsLookup'] });
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
    },
    onError: (err: any) => {
      setApplyError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Failed to submit application. Please check deadline or criteria.'
      );
    },
  });

  const handleOpenApplyModal = (opp: Opportunity) => {
    setApplyingOpp(opp);
    setApplyError(null);
    setApplySuccess(false);
    setApplicationNotes('');
    if (resumes.length > 0) {
      setSelectedResumeId(resumes[0].id);
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingOpp || !selectedResumeId) return;
    applyMutation.mutate({
      opportunityId: applyingOpp.id,
      resumeId: selectedResumeId,
      notes: applicationNotes,
    });
  };

  return (
    <div>
      <Header
        onOpenSidebar={openSidebar}
        title="Placement Opportunities"
        subtitle="Explore active recruitment drives from top verified product and services employers"
        actions={
          <Link to="/opportunities/my-applications">
            <Button variant="outline" size="sm" leftIcon={<Briefcase className="w-4 h-4" />}>
              My Applications
            </Button>
          </Link>
        }
      />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Search & Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, role, or skills..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Comm">Electronics & Comm</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
            </select>

            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="">All Employment Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="INTERNSHIP">Internship</option>
            </select>

            {(search || department || employmentType) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setDepartment('');
                  setEmploymentType('');
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Opportunity Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : isError ? (
          <ErrorAlert message="Failed to load placement opportunities" onRetry={refetch} />
        ) : opportunities.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="w-6 h-6" />}
            title="No Opportunities Found"
            description="No current placement drives match your filter criteria. Try adjusting the search keywords or filters."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {opportunities.map((opp) => {
              const hasApplied = appliedOppIds.has(opp.id);
              const isDeadlinePassed = new Date(opp.deadline) < new Date();

              return (
                <Card key={opp.id} className="flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all">
                  <CardBody className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-700 shrink-0">
                          {opp.company?.name?.[0] || 'C'}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-brand-600 block leading-tight uppercase">
                            {opp.company?.name}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{opp.title}</h3>
                        </div>
                      </div>
                      <Badge variant="purple">{opp.employmentType.replace('_', ' ')}</Badge>
                    </div>

                    {/* Metadata Pills */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 py-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{opp.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">Due {new Date(opp.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Cutoffs & Skills */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Min CGPA Cutoff:</span>
                        <span className="font-bold text-slate-800">{opp.minCgpa}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Compensation:</span>
                        <span className="font-bold text-slate-900">
                          {opp.salaryMin
                            ? `₹${(opp.salaryMin / 100000).toFixed(1)}–${(opp.salaryMax! / 100000).toFixed(1)} LPA`
                            : opp.stipend
                            ? `₹${opp.stipend.toLocaleString()}/month`
                            : 'Competitive'}
                        </span>
                      </div>

                      {/* Required skills tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {opp.requiredSkills?.slice(0, 3).map((s) => (
                          <span key={s} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            {s}
                          </span>
                        ))}
                        {opp.requiredSkills?.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{opp.requiredSkills.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </CardBody>

                  {/* Actions Footer */}
                  <CardFooter className="flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCheckEligibility(opp)}
                      leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}
                      className="text-xs"
                    >
                      Check Match
                    </Button>

                    {hasApplied ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <CheckCircle className="w-3.5 h-3.5" /> Applied
                      </span>
                    ) : isDeadlinePassed ? (
                      <span className="text-xs text-slate-400 font-medium">Closed</span>
                    ) : (
                      <Button size="sm" onClick={() => handleOpenApplyModal(opp)}>
                        Apply Now
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal: Check Eligibility & Resume Match Engine */}
        <Modal
          isOpen={!!matchingOpp}
          onClose={() => setMatchingOpp(null)}
          title={`Match Analysis: ${matchingOpp?.title}`}
          subtitle={`${matchingOpp?.company?.name} • Minimum CGPA: ${matchingOpp?.minCgpa}`}
          maxWidth="2xl"
        >
          {loadingMatch ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-700">Running AI Semantic Resume Match...</p>
              <p className="text-xs text-slate-400">Comparing profile skills against verified job requirements</p>
            </div>
          ) : matchReport ? (
            <div className="space-y-6">
              {/* Score & Official Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Official Eligibility Status */}
                <div
                  className={`p-4 rounded-xl border flex items-center gap-3 ${
                    matchReport.officialEligibility.status === 'ELIGIBLE'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : matchReport.officialEligibility.status === 'INELIGIBLE'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  {matchReport.officialEligibility.status === 'ELIGIBLE' ? (
                    <CheckCircle className="w-7 h-7 text-emerald-600 shrink-0" />
                  ) : matchReport.officialEligibility.status === 'INELIGIBLE' ? (
                    <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-7 h-7 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                      Academic Eligibility
                    </span>
                    <h4 className="text-base font-bold capitalize">
                      {matchReport.officialEligibility.status.toLowerCase()}
                    </h4>
                  </div>
                </div>

                {/* Resume Match Gauge */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Resume Relevance Score
                    </span>
                    <span className="text-lg font-bold text-brand-600">{matchReport.resumeMatch.score}%</span>
                  </div>
                  <ProgressBar value={matchReport.resumeMatch.score} size="md" color="auto" />
                </div>
              </div>

              {/* Itemized Academic Checks */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Eligibility Breakdown</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(matchReport.officialEligibility.checks).map(([key, value]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700">
                      {value}
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill-by-Skill Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Skill-by-Skill Comparison</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {matchReport.resumeMatch.skillBreakdown.map((item) => (
                    <div
                      key={item.skill}
                      className="p-2.5 rounded-lg border border-slate-200/70 bg-white flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{item.skill}</span>
                        {item.evidence && <span className="text-[11px] text-slate-400">({item.evidence})</span>}
                      </div>
                      <Badge
                        variant={
                          item.status === 'MATCHED'
                            ? 'success'
                            : item.status === 'PARTIAL'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations */}
              {matchReport.resumeMatch.recommendations.length > 0 && (
                <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200/60 text-xs text-brand-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-brand-800">
                    <Sparkles className="w-3.5 h-3.5" /> Preparation Advice:
                  </span>
                  {matchReport.resumeMatch.recommendations.map((rec, i) => (
                    <p key={i} className="text-brand-700">
                      • {rec}
                    </p>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-slate-400 italic text-center">
                {matchReport.resumeMatch.disclaimer}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">Unable to evaluate match.</p>
          )}
        </Modal>

        {/* Modal: Submit Application */}
        <Modal
          isOpen={!!applyingOpp}
          onClose={() => setApplyingOpp(null)}
          title={`Apply for ${applyingOpp?.title}`}
          subtitle={`${applyingOpp?.company?.name} • Deadline: ${
            applyingOpp ? new Date(applyingOpp.deadline).toLocaleDateString() : ''
          }`}
          maxWidth="lg"
        >
          {applySuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Application Submitted!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your resume and application details have been submitted to {applyingOpp?.company?.name}. You can track your interview progression in My Applications.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setApplyingOpp(null)}>
                  Close
                </Button>
                <Link to="/opportunities/my-applications">
                  <Button size="sm">Go to My Applications</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleApplySubmit} className="space-y-4">
              {applyError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {applyError}
                </div>
              )}

              {/* Select Resume Version */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Resume Version <span className="text-rose-500">*</span>
                </label>
                {resumes.length === 0 ? (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                    <span>No resume uploaded yet.</span>
                    <Link to="/resume-analyzer" className="font-bold underline">
                      Upload Now
                    </Link>
                  </div>
                ) : (
                  <Select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    required
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        v{r.version} — {r.originalName} ({new Date(r.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </Select>
                )}
              </div>

              {/* Optional Applicant Statement */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Applicant Notes / Cover Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  value={applicationNotes}
                  onChange={(e) => setApplicationNotes(e.target.value)}
                  placeholder="Share any specific projects or availability details relevant to this role..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setApplyingOpp(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="md"
                  disabled={!selectedResumeId}
                  isLoading={applyMutation.isPending}
                >
                  Submit Application
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
};
