import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Search,
  Building,
  ArrowRight,
  Info,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { opportunitiesApi } from '../../api/opportunities';
import { resumesApi } from '../../api/resumes';
import { matchingApi } from '../../api/matching';
import { Opportunity, Resume, JobMatchReport } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { Skeleton } from '../../components/ui/Skeleton';

export const CompanyMatcherPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('');
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [report, setReport] = useState<JobMatchReport | null>(null);

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoadingInitial(true);
        const [oppsRes, resumesRes] = await Promise.all([
          opportunitiesApi.listOpportunities({ status: 'PUBLISHED' }),
          resumesApi.getMyResumes(),
        ]);

        if (oppsRes.success && oppsRes.data) {
          setOpportunities(oppsRes.data);
          if (oppsRes.data.length > 0) {
            setSelectedOpportunityId(oppsRes.data[0].id);
          }
        }

        if (resumesRes.success && resumesRes.data) {
          setResumes(resumesRes.data);
          if (resumesRes.data.length > 0) {
            setSelectedResumeId(resumesRes.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load initial matcher data:', err);
      } finally {
        setIsLoadingInitial(false);
      }
    };
    init();
  }, []);

  const handleRunMatch = async () => {
    if (!selectedOpportunityId) return;
    try {
      setIsEvaluating(true);
      setError(null);
      const res = await matchingApi.evaluateMatch(
        selectedOpportunityId,
        selectedResumeId || undefined
      );
      if (res.success && res.data) {
        setReport(res.data);
      } else {
        setError(res.message || 'Failed to generate match evaluation.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error evaluating job match.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const selectedOpportunity = opportunities.find((o) => o.id === selectedOpportunityId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-600" />
          Company & Role Matcher
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Perform a dual-tier audit: official academic eligibility rules separated from resume content relevance and skill evidence.
        </p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Target Selection Bar */}
      <Card orientation="vertical" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              1. Select Target Placement Drive / Opportunity
            </label>
            <select
              value={selectedOpportunityId}
              onChange={(e) => setSelectedOpportunityId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            >
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.company?.name || 'Company'} — {opp.title} ({opp.employmentType})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              2. Select Resume Version
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            >
              {resumes.length === 0 ? (
                <option value="">No resumes uploaded</option>
              ) : (
                resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    v{r.version} — {r.originalName} ({new Date(r.createdAt).toLocaleDateString()})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="md:col-span-3">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={handleRunMatch}
              disabled={isEvaluating || !selectedOpportunityId}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isEvaluating ? 'Evaluating Match...' : 'Evaluate Match'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Evaluating State */}
      {isEvaluating && (
        <Card orientation="vertical" padding="lg">
          <div className="py-12 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
              <Target className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Comparing Credentials & Resume Context</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                Checking minimum CGPA, active backlogs, graduation batch eligibility, and cross-referencing required job skills against your resume.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Results View */}
      {!isEvaluating && report && (
        <div className="space-y-6">
          {/* Top Banner: Eligibility & Match Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Official Academic Eligibility (Rules Engine) */}
            <div className="lg:col-span-6">
              <Card orientation="vertical" padding="lg" className="h-full">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-base">Official Eligibility Check</h3>
                  </div>
                  <Badge
                    variant={
                      report.officialEligibility.status === 'ELIGIBLE'
                        ? 'success'
                        : report.officialEligibility.status === 'INELIGIBLE'
                        ? 'danger'
                        : 'warning'
                    }
                    size="md"
                  >
                    {report.officialEligibility.status}
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  <p className="text-xs text-slate-500">
                    Official institution and drive criteria verification determined by your student profile:
                  </p>

                  <div className="space-y-2">
                    {Object.entries(report.officialEligibility.checks || {}).map(([key, val]) => {
                      const isPassing =
                        typeof val === 'string' &&
                        (val.toLowerCase().includes('eligible') ||
                          val.toLowerCase().includes('pass') ||
                          val.toLowerCase().includes('satisfied') ||
                          val.toLowerCase().includes('met'));
                      const isFailing =
                        typeof val === 'string' &&
                        (val.toLowerCase().includes('not eligible') ||
                          val.toLowerCase().includes('fail') ||
                          val.toLowerCase().includes('below') ||
                          val.toLowerCase().includes('exceeds'));

                      return (
                        <div
                          key={key}
                          className="flex items-start justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                        >
                          <span className="font-semibold text-slate-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span
                            className={`font-medium text-right max-w-[60%] ${
                              isPassing
                                ? 'text-emerald-700 font-semibold'
                                : isFailing
                                ? 'text-rose-700 font-semibold'
                                : 'text-slate-600'
                            }`}
                          >
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>

            {/* Resume Content Match Score */}
            <div className="lg:col-span-6">
              <Card orientation="vertical" padding="lg" className="h-full">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-base">Resume Relevance Score</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {report.resumeEvaluated
                      ? `Based on v${report.resumeEvaluated.version}`
                      : 'No resume attached'}
                  </span>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <div
                      className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 ${
                        report.resumeMatch.score >= 75
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : report.resumeMatch.score >= 50
                          ? 'border-amber-500 bg-amber-50 text-amber-800'
                          : 'border-rose-500 bg-rose-50 text-rose-800'
                      }`}
                    >
                      <span className="text-2xl font-black">{report.resumeMatch.score}%</span>
                      <span className="text-[10px] font-bold uppercase">Match</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <p className="font-medium text-slate-800">
                      {report.resumeMatch.score >= 75
                        ? 'High overlap with requested technical and problem-solving requirements.'
                        : report.resumeMatch.score >= 50
                        ? 'Moderate alignment. Key core competencies match, but notable secondary tools are missing.'
                        : 'Low match detected. Several critical required technologies are not found in this resume version.'}
                    </p>
                    <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-800">
                      <p className="font-semibold flex items-center gap-1 mb-0.5">
                        <Info className="w-3.5 h-3.5 text-amber-600" />
                        Important Non-Guarantee Disclaimer:
                      </p>
                      {report.resumeMatch.disclaimer ||
                        'Match score reflects text and skill overlap only. It does not predict or guarantee interview shortlisting or job offer.'}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Skill-by-Skill Breakdown Table */}
          <Card orientation="vertical" padding="lg">
            <h3 className="font-bold text-slate-900 text-base mb-2">
              Skill-by-Skill Requirement Analysis
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Detailed mapping between opportunity prerequisites and detected evidence in your parsed resume:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Required Skill</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Resume Evidence / Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.resumeMatch.skillBreakdown && report.resumeMatch.skillBreakdown.length > 0 ? (
                    report.resumeMatch.skillBreakdown.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 font-semibold text-slate-900">{item.skill}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[11px] ${
                              item.status === 'MATCHED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'PARTIAL'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.status === 'MATCHED' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : item.status === 'PARTIAL' ? (
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                            ) : (
                              <XCircle className="w-3 h-3 text-rose-600" />
                            )}
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                          {item.evidence || (
                            <span className="text-slate-400 italic">No direct keyword or project match found</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400 italic">
                        No specific skills mapped for this opportunity.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Missing Skills & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card orientation="vertical" padding="md" className="border-l-4 border-l-rose-500">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3 text-rose-800">
                <XCircle className="w-4 h-4 text-rose-600" />
                Missing Required Skills
              </h4>
              {report.resumeMatch.missingRequiredSkills &&
              report.resumeMatch.missingRequiredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {report.resumeMatch.missingRequiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  None! Your resume covers all mandatory skills listed in this job requirement.
                </p>
              )}
            </Card>

            <Card orientation="vertical" padding="md" className="border-l-4 border-l-indigo-500">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3 text-indigo-800">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Personalized Preparation Roadmap
              </h4>
              {report.resumeMatch.recommendations && report.resumeMatch.recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {report.resumeMatch.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No specific recommendations.</p>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Initial Empty View */}
      {!isEvaluating && !report && (
        <Card orientation="vertical" padding="lg">
          <EmptyState
            icon={Target}
            title="Ready to Evaluate Match"
            description="Select an active placement drive and your resume version above, then click 'Evaluate Match' to inspect requirements alignment."
            actionLabel="Run Evaluation"
            onAction={handleRunMatch}
          />
        </Card>
      )}
    </div>
  );
};
