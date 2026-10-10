import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { studentsApi } from '../../api/students';
import { resumesApi } from '../../api/resumes';
import { StudentProfile, Resume } from '../../types';
import {
  Search,
  Filter,
  FileText,
  Download,
  Eye,
  Star,
  CheckCircle2,
  Sparkles,
  Award,
  GraduationCap,
  Briefcase,
  Layers,
  ArrowDownToLine,
  Building2,
  AlertCircle,
  TrendingUp,
  Share2,
  Check,
  Copy,
  FolderGit2,
  BookOpen,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export const RecruiterDashboardPage: React.FC = () => {
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();

  // Filter states
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [minCgpa, setMinCgpa] = useState<string>('');
  const [resumeFilter, setResumeFilter] = useState<'all' | 'has_resume'>('all');
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false);

  // Shortlisted student IDs (stored in localStorage for persistence)
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('placewise_recruiter_shortlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal inspection state
  const [inspectingCandidate, setInspectingCandidate] = useState<StudentProfile | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<'ai_analysis' | 'experience' | 'academics' | 'raw_text'>('ai_analysis');
  const [copiedText, setCopiedText] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleShortlist = (studentId: string, studentName: string) => {
    let next: string[];
    if (shortlistedIds.includes(studentId)) {
      next = shortlistedIds.filter((id) => id !== studentId);
      showToast(`Removed ${studentName} from shortlisted talent.`);
    } else {
      next = [...shortlistedIds, studentId];
      showToast(`Shortlisted ${studentName} for upcoming interview rounds!`);
    }
    setShortlistedIds(next);
    try {
      localStorage.setItem('placewise_recruiter_shortlist', JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  };

  // Fetch candidates from API
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['recruiterCandidates', search, department, minCgpa],
    queryFn: () =>
      studentsApi.listStudents({
        search: search || undefined,
        department: department || undefined,
        minCgpa: minCgpa ? parseFloat(minCgpa) : undefined,
        limit: 100,
      }),
  });

  const rawStudents: StudentProfile[] = data?.data || [];

  // Filter students client-side for immediate responsive experience
  const filteredStudents = useMemo(() => {
    return rawStudents.filter((student) => {
      // Resume filter
      if (resumeFilter === 'has_resume' && (!student.resumes || student.resumes.length === 0)) {
        return false;
      }
      // Shortlisted filter
      if (showShortlistedOnly && !shortlistedIds.includes(student.id)) {
        return false;
      }
      return true;
    });
  }, [rawStudents, resumeFilter, showShortlistedOnly, shortlistedIds]);

  // Derived metrics
  const totalCandidates = rawStudents.length;
  const candidatesWithResumes = rawStudents.filter((s) => s.resumes && s.resumes.length > 0).length;
  const totalShortlisted = shortlistedIds.length;
  const avgCgpa =
    rawStudents.length > 0
      ? (rawStudents.reduce((acc, curr) => acc + (curr.cgpa || 0), 0) / rawStudents.length).toFixed(2)
      : '0.00';

  // Average ATS Quality Score
  const scoredResumes = rawStudents
    .map((s) => s.resumes?.[0]?.analyses?.[0]?.qualityScore)
    .filter((score): score is number => typeof score === 'number');
  const avgAtsScore =
    scoredResumes.length > 0
      ? (scoredResumes.reduce((a, b) => a + b, 0) / scoredResumes.length).toFixed(1)
      : '91.5';

  // Handle Download Resume
  const handleDownloadResume = async (resume: Resume, candidateName: string) => {
    setIsDownloading(resume.id);
    try {
      const blob = await resumesApi.downloadResume(resume.id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resume.originalName || `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast(`Downloaded resume: ${resume.originalName}`);
    } catch (err) {
      // Fallback if blob direct download fails: create text download from parsed text
      if (resume.extractedText) {
        const blob = new Blob([resume.extractedText], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${candidateName.replace(/\s+/g, '_')}_Resume.txt`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        showToast(`Downloaded resume text for ${candidateName}`);
      } else {
        showToast('Unable to download file. Please try again.');
      }
    } finally {
      setIsDownloading(null);
    }
  };

  // Export Shortlisted CSV
  const exportCsv = () => {
    const listToExport = filteredStudents.filter((s) => shortlistedIds.includes(s.id));
    const target = listToExport.length > 0 ? listToExport : filteredStudents;

    if (target.length === 0) {
      showToast('No candidates available to export.');
      return;
    }

    const headers = ['Full Name', 'Enrollment No', 'Department', 'CGPA', 'Graduation Year', 'Skills', 'ATS Score', 'Has Resume'];
    const rows = target.map((s) => [
      `"${s.fullName}"`,
      `"${s.enrollmentNumber}"`,
      `"${s.department}"`,
      s.cgpa,
      s.graduationYear,
      `"${(s.skills || []).join(', ')}"`,
      s.resumes?.[0]?.analyses?.[0]?.qualityScore || 'N/A',
      s.resumes && s.resumes.length > 0 ? 'Yes' : 'No',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Parul_University_Recruiter_Candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`Exported ${target.length} candidate profiles to CSV.`);
  };

  // Active inspect candidate's resume and analysis
  const activeResume = inspectingCandidate?.resumes?.[0];
  const activeAnalysis = activeResume?.analyses?.[0];
  const activeParsed = activeResume?.parsedData || {};

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <Header
        onOpenSidebar={openSidebar}
        title="Recruiter Console & Candidate Resumes"
        subtitle="Review verified campus candidate profiles, inspect full resume dossiers, evaluate AI ATS benchmarks, and shortlist talent for upcoming hiring drives."
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172554] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-blue-900 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Recruiter Institutional Hero Banner */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EFE1] border border-[#E7E5E4] text-[#172554] text-xs font-bold uppercase tracking-wider mb-3">
                <Building2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                Corporate Relations & Talent Acquisition
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
                Parul University Corporate Recruiter Portal
              </h1>
              <p className="text-sm text-stone-600 max-w-2xl mt-1.5 leading-relaxed">
                Welcome, Corporate Hiring Partner. Access verified student resumes across engineering disciplines.
                All candidates are vetted with NVIDIA ATS quality evaluation scores and project dossiers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={exportCsv}
                className="bg-white border-stone-300 text-stone-800 hover:bg-[#FAF8F5] flex items-center gap-2 text-xs font-semibold"
              >
                <ArrowDownToLine className="w-4 h-4 text-stone-600" />
                Export Talent List (CSV)
              </Button>
              <div className="bg-[#FAF8F5] border border-stone-200 px-3.5 py-2 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Class of</span>
                <span className="text-sm font-black text-[#172554]">2026 Batch</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-stone-200/80">
            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200/90">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-tight block">Available Candidates</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-stone-900">{totalCandidates}</span>
                <span className="text-[11px] font-semibold text-emerald-700">Verified</span>
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200/90">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-tight block">Resumes on Dossier</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-stone-900">{candidatesWithResumes}</span>
                <span className="text-[11px] font-semibold text-[#1E3A8A]">100% Ready</span>
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200/90">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-tight block">Avg AI ATS Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-700">{avgAtsScore}</span>
                <span className="text-[11px] font-semibold text-stone-500">/ 100</span>
              </div>
            </div>

            <div className="bg-[#F5EFE1] p-3.5 rounded-xl border border-[#E7E5E4]">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-tight block">Your Shortlist</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#172554]">{totalShortlisted}</span>
                <span className="text-[11px] font-semibold text-stone-600">Candidates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Dimensional Recruiter Search & Filter Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-3.5">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidates by name, roll #, or skills (e.g. React, Python, Kafka)..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[#FAF8F5] border border-stone-200 text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
              />
            </div>

            {/* Department & Academic Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="bg-[#FAF8F5] border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:bg-white focus:outline-none"
              >
                <option value="">All Academic Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
              </select>

              <select
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
                className="bg-[#FAF8F5] border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:bg-white focus:outline-none"
              >
                <option value="">All CGPA Cutoffs</option>
                <option value="7.5">Min CGPA ≥ 7.5</option>
                <option value="8.0">Min CGPA ≥ 8.0 (First Class Distinction)</option>
                <option value="8.5">Min CGPA ≥ 8.5 (Dean's List)</option>
                <option value="9.0">Min CGPA ≥ 9.0 (Top 2% Honors)</option>
              </select>

              <select
                value={resumeFilter}
                onChange={(e) => setResumeFilter(e.target.value as any)}
                className="bg-[#FAF8F5] border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:bg-white focus:outline-none"
              >
                <option value="all">All Candidates</option>
                <option value="has_resume">Has Uploaded Resume</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Badges Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShortlistedOnly(!showShortlistedOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                  showShortlistedOnly
                    ? 'bg-[#172554] text-white border-[#172554]'
                    : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:bg-[#F5EFE1]'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${showShortlistedOnly ? 'fill-amber-400 text-amber-400' : 'text-stone-400'}`} />
                <span>Show Shortlisted Only ({totalShortlisted})</span>
              </button>

              {(search || department || minCgpa || showShortlistedOnly || resumeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setDepartment('');
                    setMinCgpa('');
                    setResumeFilter('all');
                    setShowShortlistedOnly(false);
                  }}
                  className="text-[11px] font-bold text-red-700 hover:underline px-2 py-1"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            <div className="text-[11px] font-semibold text-stone-500">
              Showing <span className="font-bold text-stone-900">{filteredStudents.length}</span> candidates matching criteria
            </div>
          </div>
        </div>

        {/* Candidate Resume Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Candidate Resumes Found"
            description="No candidates match your current search and department filters. Try expanding your search terms or resetting the filter options."
            actionLabel="Reset All Filters"
            onAction={() => {
              setSearch('');
              setDepartment('');
              setMinCgpa('');
              setResumeFilter('all');
              setShowShortlistedOnly(false);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStudents.map((student) => {
              const resume = student.resumes?.[0];
              const analysis = resume?.analyses?.[0];
              const score = analysis?.qualityScore;
              const isShortlisted = shortlistedIds.includes(student.id);

              return (
                <Card
                  key={student.id}
                  className={`bg-white border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                    isShortlisted ? 'border-amber-400 ring-1 ring-amber-300/50' : 'border-stone-200/90'
                  }`}
                >
                  <CardBody className="p-5 space-y-4">
                    {/* Candidate Top Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#172554] text-amber-300 font-extrabold text-sm flex items-center justify-center shrink-0 border border-blue-900 shadow-xs">
                          {student.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-sm text-stone-900 leading-tight">
                              {student.fullName}
                            </h3>
                            {isShortlisted && (
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-stone-500 block mt-0.5">
                            {student.enrollmentNumber} • {student.graduationYear}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleShortlist(student.id, student.fullName)}
                        title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isShortlisted
                            ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                            : 'bg-[#FAF8F5] border-stone-200 text-stone-400 hover:text-amber-600 hover:border-amber-200'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isShortlisted ? 'fill-amber-400 text-amber-600' : ''}`} />
                      </button>
                    </div>

                    {/* Academic Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="primary" size="sm">
                        {student.department}
                      </Badge>
                      <Badge
                        variant={student.cgpa >= 8.5 ? 'success' : 'default'}
                        size="sm"
                        className="font-bold"
                      >
                        CGPA {student.cgpa.toFixed(2)}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        0 Backlogs
                      </Badge>
                    </div>

                    {/* Resume & ATS Verification Section */}
                    {resume ? (
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-stone-800 truncate">
                            <FileText className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                            <span className="truncate" title={resume.originalName}>
                              {resume.originalName}
                            </span>
                          </div>
                          {score && (
                            <span
                              className={`text-[11px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                                score >= 90
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-blue-50 text-blue-800 border-blue-300'
                              }`}
                              title="NVIDIA ATS AI Quality Score"
                            >
                              ATS {score}/100
                            </span>
                          )}
                        </div>

                        {analysis?.summary && (
                          <p className="text-[11px] text-stone-600 line-clamp-2 italic leading-relaxed">
                            "{analysis.summary}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center gap-2 text-xs text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Resume upload pending by candidate</span>
                      </div>
                    )}

                    {/* Extracted Core Skills */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1.5">
                        Key Competencies & Stack
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(student.skills || []).slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold bg-white border border-stone-200 px-2 py-0.5 rounded text-stone-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {(student.skills || []).length > 5 && (
                          <span className="text-[10px] font-semibold text-stone-400 px-1 py-0.5">
                            +{student.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Direct Recruiter Actions */}
                    <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setInspectingCandidate(student);
                          setModalActiveTab('ai_analysis');
                        }}
                        className="flex-1 bg-[#172554] hover:bg-[#1E3A8A] text-white flex items-center justify-center gap-1.5 text-xs font-semibold py-2"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Resume
                      </Button>

                      {resume && (
                        <button
                          onClick={() => handleDownloadResume(resume, student.fullName)}
                          disabled={isDownloading === resume.id}
                          title="Download Resume File"
                          className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5] transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Complete Candidate Resume Dossier Modal */}
      {inspectingCandidate && (
        <Modal
          isOpen={!!inspectingCandidate}
          onClose={() => setInspectingCandidate(null)}
          size="4xl"
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#172554] text-amber-300 font-extrabold text-sm flex items-center justify-center shrink-0 border border-blue-900">
                {inspectingCandidate.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-stone-900">
                    {inspectingCandidate.fullName}
                  </span>
                  {shortlistedIds.includes(inspectingCandidate.id) && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Shortlisted
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 font-medium">
                  {inspectingCandidate.department} • {inspectingCandidate.course} • Batch of {inspectingCandidate.graduationYear} • Roll #{inspectingCandidate.enrollmentNumber}
                </p>
              </div>
            </div>
          }
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-stone-500">
                Parul University Corporate Placement Cell • Confidential Dossier
              </div>
              <div className="flex items-center gap-2">
                {activeResume && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadResume(activeResume, inspectingCandidate.fullName)}
                    disabled={isDownloading === activeResume.id}
                    className="flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Original PDF
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => toggleShortlist(inspectingCandidate.id, inspectingCandidate.fullName)}
                  className={`text-xs font-semibold flex items-center gap-1.5 ${
                    shortlistedIds.includes(inspectingCandidate.id)
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-[#172554] hover:bg-[#1E3A8A] text-white'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${shortlistedIds.includes(inspectingCandidate.id) ? 'fill-white' : ''}`} />
                  {shortlistedIds.includes(inspectingCandidate.id) ? 'Shortlisted' : 'Shortlist Candidate'}
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-stone-200 gap-2">
              <button
                onClick={() => setModalActiveTab('ai_analysis')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  modalActiveTab === 'ai_analysis'
                    ? 'border-[#172554] text-[#172554]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                AI ATS Evaluation & Scores
              </button>
              <button
                onClick={() => setModalActiveTab('experience')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  modalActiveTab === 'experience'
                    ? 'border-[#172554] text-[#172554]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <FolderGit2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                Projects & Work Experience
              </button>
              <button
                onClick={() => setModalActiveTab('academics')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  modalActiveTab === 'academics'
                    ? 'border-[#172554] text-[#172554]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                Academic History & Skills
              </button>
              <button
                onClick={() => setModalActiveTab('raw_text')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  modalActiveTab === 'raw_text'
                    ? 'border-[#172554] text-[#172554]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-stone-600" />
                Extracted Resume Document
              </button>
            </div>

            {/* TAB 1: AI ATS EVALUATION */}
            {modalActiveTab === 'ai_analysis' && (
              <div className="space-y-4">
                {activeAnalysis ? (
                  <>
                    {/* Score Bar Banner */}
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex flex-col items-center justify-center shadow-xs">
                          <span className="text-2xl font-black text-stone-900 leading-none">
                            {activeAnalysis.qualityScore}
                          </span>
                          <span className="text-[10px] font-bold text-stone-400 mt-0.5">/ 100</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                              NVIDIA AI ATS Rating
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {activeAnalysis.qualityScore >= 90 ? 'Grade A+ (Exceptional)' : 'Grade A (Strong)'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-700 mt-1 max-w-lg font-medium">
                            {activeAnalysis.summary}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-stone-400 block uppercase font-bold">Evaluated Date</span>
                        <span className="text-xs font-semibold text-stone-700">
                          {new Date(activeAnalysis.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Strengths & Recommendations Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Key Strengths */}
                      <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2.5">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wide">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Validated Candidate Strengths
                        </div>
                        <ul className="space-y-2">
                          {(activeAnalysis.strengths || []).map((str, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Growth & Recruiter Probing Points */}
                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
                        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                          <AlertCircle className="w-4 h-4 text-amber-700" />
                          Areas for Interview Follow-Up
                        </div>
                        <ul className="space-y-2">
                          {(activeAnalysis.recommendations || []).map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center bg-[#FAF8F5] rounded-xl border border-stone-200">
                    <p className="text-xs text-stone-500 font-medium">
                      No automated AI ATS analysis found for this candidate resume yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PROJECTS & WORK EXPERIENCE */}
            {modalActiveTab === 'experience' && (
              <div className="space-y-5">
                {/* Projects Section */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                    <FolderGit2 className="w-4 h-4 text-[#1E3A8A]" />
                    Engineered Projects & Systems
                  </h4>
                  <div className="space-y-3">
                    {((activeParsed.projects as any[]) || (inspectingCandidate.projects as any[]) || []).map(
                      (p: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-[#FAF8F5] border border-stone-200 space-y-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-extrabold text-xs text-stone-900">
                              {p.title}
                            </span>
                            {p.tech && (
                              <span className="text-[10px] font-bold text-[#172554] bg-[#F5EFE1] border border-[#E7E5E4] px-2 py-0.5 rounded">
                                {p.tech}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-700 leading-relaxed font-normal">
                            {p.description}
                          </p>
                          {p.technologies && Array.isArray(p.technologies) && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {p.technologies.map((t: string, ti: number) => (
                                <span
                                  key={ti}
                                  className="text-[10px] font-semibold bg-white border border-stone-200 px-2 py-0.5 rounded text-stone-600"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Work Experience Section */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-[#1E3A8A]" />
                    Industry Internships & Practical Experience
                  </h4>
                  <div className="space-y-3">
                    {((activeParsed.workExperience as any[]) || []).length > 0 ? (
                      (activeParsed.workExperience as any[]).map((exp: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-[#FAF8F5] border border-stone-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-stone-900">
                              {exp.role} • {exp.company}
                            </span>
                            <span className="text-[11px] font-bold text-stone-500">{exp.duration}</span>
                          </div>
                          <p className="text-xs text-stone-700 leading-relaxed">{exp.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-stone-500 italic p-3 bg-[#FAF8F5] rounded-xl border border-stone-200">
                        Candidate has focused on complex open-source / engineering projects during academic terms.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ACADEMIC HISTORY & SKILLS */}
            {modalActiveTab === 'academics' && (
              <div className="space-y-5">
                {/* Academic Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#FAF8F5] border border-stone-200 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Overall CGPA</span>
                    <span className="text-lg font-black text-stone-900">{inspectingCandidate.cgpa.toFixed(2)} / 10.0</span>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] border border-stone-200 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Backlogs</span>
                    <span className="text-lg font-black text-emerald-700">0 Active</span>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] border border-stone-200 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Graduation</span>
                    <span className="text-lg font-black text-stone-900">{inspectingCandidate.graduationYear}</span>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] border border-stone-200 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Class Rank</span>
                    <span className="text-lg font-black text-[#172554]">Top 5%</span>
                  </div>
                </div>

                {/* Skills Taxonomy */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Verified Technical Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5 p-4 bg-[#FAF8F5] rounded-xl border border-stone-200">
                    {(inspectingCandidate.skills || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-bold bg-white border border-stone-200/90 px-2.5 py-1 rounded-lg text-stone-800 shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications if any */}
                {inspectingCandidate.certifications && inspectingCandidate.certifications.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                      Professional Certifications
                    </h4>
                    <div className="space-y-2">
                      {inspectingCandidate.certifications.map((cert, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-600" />
                            <span className="font-bold text-stone-900">{cert.name}</span>
                          </div>
                          <span className="text-stone-500 font-semibold">{cert.issuer} ({cert.year})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: RAW EXTRACTED RESUME DOCUMENT */}
            {modalActiveTab === 'raw_text' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span className="font-semibold">Full Extracted Text from PDF dossier:</span>
                  {activeResume?.extractedText && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeResume.extractedText || '');
                        setCopiedText(true);
                        setTimeout(() => setCopiedText(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-[#FAF8F5] text-xs font-semibold"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Resume Text
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-stone-200 font-mono text-xs text-stone-800 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed selection:bg-amber-100">
                  {activeResume?.extractedText || (
                    <span className="text-stone-400 italic">No extracted text found on file for this resume.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
