import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Building,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileDown,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Send,
  AlertCircle,
  XCircle,
  Download,
} from 'lucide-react';
import { opportunitiesApi } from '../../api/opportunities';
import { companiesApi } from '../../api/companies';
import { applicationsApi } from '../../api/applications';
import { resumesApi } from '../../api/resumes';
import { Opportunity, Company, ApplicationStage, OpportunityStatus } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { Skeleton } from '../../components/ui/Skeleton';

const STAGES: ApplicationStage[] = [
  'APPLIED',
  'SHORTLISTED',
  'ASSESSMENT',
  'TECHNICAL_INTERVIEW',
  'HR_INTERVIEW',
  'OFFERED',
  'REJECTED',
  'WITHDRAWN',
];

export const ManagerOpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Opportunity Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [location, setLocation] = useState('Bangalore, India');
  const [salaryMax, setSalaryMax] = useState('1800000');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [maxBacklogsAllowed, setMaxBacklogsAllowed] = useState('0');
  const [allowedDepartments, setAllowedDepartments] = useState('CSE, ECE, IT');
  const [allowedGraduationYears, setAllowedGraduationYears] = useState('2025');
  const [requiredSkills, setRequiredSkills] = useState('Java, Spring Boot, SQL');
  const [deadline, setDeadline] = useState('2026-11-30');
  const [description, setDescription] = useState('');
  const [isSubmittingDrive, setIsSubmittingDrive] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Applicant Review Drawer/Modal
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [stageUpdatingAppId, setStageUpdatingAppId] = useState<string | null>(null);
  const [selectedNewStage, setSelectedNewStage] = useState<ApplicationStage>('SHORTLISTED');
  const [stageRemarks, setStageRemarks] = useState('');
  const [isSubmittingStage, setIsSubmittingStage] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [oppsRes, compRes] = await Promise.all([
        opportunitiesApi.listOpportunities(),
        companiesApi.listCompanies(),
      ]);

      if (oppsRes.success && oppsRes.data) setOpportunities(oppsRes.data);
      if (compRes.success && compRes.data) {
        setCompanies(compRes.data);
        if (compRes.data.length > 0) setCompanyId(compRes.data[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load drive management data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingDrive(true);
      setCreateError(null);

      const payload = {
        companyId,
        title,
        employmentType,
        location,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        minCgpa: Number(minCgpa),
        maxBacklogsAllowed: Number(maxBacklogsAllowed),
        allowedDepartments: allowedDepartments.split(',').map((d) => d.trim()),
        allowedGraduationYears: allowedGraduationYears.split(',').map((y) => Number(y.trim())),
        requiredSkills: requiredSkills.split(',').map((s) => s.trim()),
        deadline: new Date(deadline).toISOString(),
        description: description || `Placement drive for ${title}`,
      };

      const res = await opportunitiesApi.createOpportunity(payload);
      if (res.success) {
        setIsCreateModalOpen(false);
        fetchData();
      } else {
        setCreateError(res.message || 'Failed to create drive.');
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Error creating placement drive.');
    } finally {
      setIsSubmittingDrive(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await opportunitiesApi.publishOpportunity(id);
      fetchData();
    } catch (err) {
      console.error('Publish failed', err);
    }
  };

  const handleClose = async (id: string) => {
    try {
      await opportunitiesApi.closeOpportunity(id);
      fetchData();
    } catch (err) {
      console.error('Close failed', err);
    }
  };

  const handleOpenApplicants = async (opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setIsLoadingApplicants(true);
    try {
      const res = await opportunitiesApi.getApplicants(opp.id);
      if (res.success && res.data) {
        setApplicants(res.data);
      }
    } catch (err) {
      console.error('Failed to load applicants', err);
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  const handleUpdateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageUpdatingAppId || !selectedOpportunity) return;

    try {
      setIsSubmittingStage(true);
      const res = await applicationsApi.updateStage(stageUpdatingAppId, {
        newStage: selectedNewStage,
        remarks: stageRemarks || undefined,
      });

      if (res.success) {
        setStageUpdatingAppId(null);
        setStageRemarks('');
        // Refresh applicants
        const updated = await opportunitiesApi.getApplicants(selectedOpportunity.id);
        if (updated.success && updated.data) {
          setApplicants(updated.data);
        }
      }
    } catch (err) {
      console.error('Stage update failed', err);
    } finally {
      setIsSubmittingStage(false);
    }
  };

  const handleExportCSV = async (oppId: string, title: string) => {
    try {
      const res = await applicationsApi.exportApplications(oppId);
      if (res.success && res.data) {
        const rows = res.data;
        if (rows.length === 0) {
          alert('No applications to export.');
          return;
        }

        const headers = Object.keys(rows[0]).join(',');
        const csvContent =
          'data:text/csv;charset=utf-8,' +
          [headers, ...rows.map((r: any) => Object.values(r).join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${title.replace(/\s+/g, '_')}_Applicants.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error('CSV Export failed', err);
    }
  };

  const handleDownloadResume = async (resumeId: string, filename: string) => {
    try {
      const blob = await resumesApi.downloadResume(resumeId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            Placement Drives Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Author and publish placement opportunities, review candidates, verify eligibility rules, and transition recruitment stages.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Opportunity
        </Button>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Opportunities List Card */}
      <Card orientation="vertical" padding="lg">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h2 className="font-bold text-slate-900 text-base">All Placement Drives ({opportunities.length})</h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : opportunities.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No Drives Created Yet"
            description="Create your first placement drive with institutional eligibility criteria to begin accepting applications."
            actionLabel="Create Opportunity"
            onAction={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Company & Title</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Type & Location</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Deadline</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Min CGPA</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Applicants</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {opportunities.map((opp) => {
                  return (
                    <tr key={opp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{opp.title}</div>
                        <div className="text-[11px] text-slate-500 font-semibold">{opp.company?.name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-700">{opp.employmentType}</span>
                        <div className="text-[11px] text-slate-400">{opp.location}</div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            opp.status === 'PUBLISHED'
                              ? 'success'
                              : opp.status === 'CLOSED'
                              ? 'default'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {opp.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {new Date(opp.deadline).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{opp.minCgpa}</td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleOpenApplicants(opp)}
                          className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5" />
                          View Candidates
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {opp.status === 'DRAFT' && (
                            <Button variant="primary" size="sm" onClick={() => handlePublish(opp.id)}>
                              Publish
                            </Button>
                          )}
                          {opp.status === 'PUBLISHED' && (
                            <Button variant="outline" size="sm" onClick={() => handleClose(opp.id)}>
                              Close Drive
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleExportCSV(opp.id, opp.title)}
                            title="Export Applicants CSV"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Opportunity Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Post New Campus Placement Drive"
        size="lg"
      >
        <form onSubmit={handleCreateOpportunity} className="space-y-4">
          {createError && <ErrorAlert message={createError} onDismiss={() => setCreateError(null)} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Company *
              </label>
              <select
                required
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Associate Software Engineer"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Annual CTC / Stipend (₹)
              </label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Academic Criteria */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Academic Eligibility Rules
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Min CGPA
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Max Active Backlogs
                </label>
                <input
                  type="number"
                  value={maxBacklogsAllowed}
                  onChange={(e) => setMaxBacklogsAllowed(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Allowed Branches
                </label>
                <input
                  type="text"
                  value={allowedDepartments}
                  onChange={(e) => setAllowedDepartments(e.target.value)}
                  placeholder="CSE, ECE, IT"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Batch Years
                </label>
                <input
                  type="text"
                  value={allowedGraduationYears}
                  onChange={(e) => setAllowedGraduationYears(e.target.value)}
                  placeholder="2025, 2026"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Required Technical Skills (Comma-separated)
              </label>
              <input
                type="text"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="e.g. React, Node.js, PostgreSQL"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Application Deadline *
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Job Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline responsibilities, interview rounds, and job requirements..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmittingDrive}>
              {isSubmittingDrive ? 'Creating...' : 'Create Drive'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Applicants Modal */}
      {selectedOpportunity && (
        <Modal
          isOpen={!!selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          title={`Applicants Review — ${selectedOpportunity.title} (${selectedOpportunity.company?.name})`}
          size="xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500">
                Total Applicants: {applicants.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV(selectedOpportunity.id, selectedOpportunity.title)}
              >
                <FileDown className="w-3.5 h-3.5 mr-1.5" />
                Export CSV
              </Button>
            </div>

            {isLoadingApplicants ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : applicants.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Applicants Registered Yet"
                description="Eligible students have not submitted applications for this opportunity."
              />
            ) : (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 sticky top-0">
                      <th className="py-2.5 px-3 font-semibold text-slate-700">Student Name</th>
                      <th className="py-2.5 px-3 font-semibold text-slate-700">Department / CGPA</th>
                      <th className="py-2.5 px-3 font-semibold text-slate-700">Current Stage</th>
                      <th className="py-2.5 px-3 font-semibold text-slate-700">Resume</th>
                      <th className="py-2.5 px-3 font-semibold text-slate-700 text-right">Update Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applicants.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{app.student?.fullName}</div>
                          <div className="text-[10px] text-slate-400">{app.student?.enrollmentNumber}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-slate-700">{app.student?.department}</span>
                          <span className="text-slate-400 ml-1.5">(CGPA: {app.student?.cgpa})</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant="primary" size="sm">
                            {app.currentStage}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          {app.resume && (
                            <button
                              onClick={() =>
                                handleDownloadResume(app.resume.id, app.resume.originalName)
                              }
                              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              v{app.resume.version}
                            </button>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setStageUpdatingAppId(app.id);
                              setSelectedNewStage(app.currentStage);
                              setStageRemarks('');
                            }}
                          >
                            Transition
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedOpportunity(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Stage Transition Modal */}
      {stageUpdatingAppId && (
        <Modal
          isOpen={!!stageUpdatingAppId}
          onClose={() => setStageUpdatingAppId(null)}
          title="Update Candidate Recruitment Stage"
          size="md"
        >
          <form onSubmit={handleUpdateStage} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                New Recruitment Stage *
              </label>
              <select
                value={selectedNewStage}
                onChange={(e) => setSelectedNewStage(e.target.value as ApplicationStage)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Remarks / Recruiter Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={stageRemarks}
                onChange={(e) => setStageRemarks(e.target.value)}
                placeholder="e.g. Cleared online coding assessment with 100% score; invited for Technical Round 1."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setStageUpdatingAppId(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={isSubmittingStage}>
                {isSubmittingStage ? 'Updating...' : 'Confirm Stage Change'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
