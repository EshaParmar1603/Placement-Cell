import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOutletContext, Link } from 'react-router-dom';
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
  Star,
  Download,
  Eye,
  FileText,
  UserCheck,
  Building2,
  Trash2,
  ArrowDownToLine,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const RecruiterShortlistPage: React.FC = () => {
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();

  // Shortlisted IDs from localStorage
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('placewise_recruiter_shortlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inspectingCandidate, setInspectingCandidate] = useState<StudentProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const removeShortlist = (studentId: string, studentName: string) => {
    const next = shortlistedIds.filter((id) => id !== studentId);
    setShortlistedIds(next);
    try {
      localStorage.setItem('placewise_recruiter_shortlist', JSON.stringify(next));
    } catch {
      // ignore
    }
    showToast(`Removed ${studentName} from shortlist.`);
  };

  const clearAllShortlist = () => {
    setShortlistedIds([]);
    try {
      localStorage.removeItem('placewise_recruiter_shortlist');
    } catch {
      // ignore
    }
    showToast('Cleared all shortlisted candidates.');
  };

  // Fetch all students to match shortlisted ones
  const { data, isLoading } = useQuery({
    queryKey: ['recruiterCandidates'],
    queryFn: () => studentsApi.listStudents({ limit: 100 }),
  });

  const allStudents = data?.data || [];
  const shortlistedCandidates = allStudents.filter((s) => shortlistedIds.includes(s.id));

  // Export CSV
  const exportCsv = () => {
    if (shortlistedCandidates.length === 0) {
      showToast('No candidates in shortlist to export.');
      return;
    }

    const headers = ['Full Name', 'Enrollment No', 'Department', 'CGPA', 'Graduation Year', 'Skills', 'ATS Score', 'Resume Name'];
    const rows = shortlistedCandidates.map((s) => [
      `"${s.fullName}"`,
      `"${s.enrollmentNumber}"`,
      `"${s.department}"`,
      s.cgpa,
      s.graduationYear,
      `"${(s.skills || []).join(', ')}"`,
      s.resumes?.[0]?.analyses?.[0]?.qualityScore || 'N/A',
      `"${s.resumes?.[0]?.originalName || 'None'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Parul_University_Shortlisted_Recruiter_Candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`Exported ${shortlistedCandidates.length} shortlisted candidates.`);
  };

  const handleDownloadResume = async (resume: Resume, candidateName: string) => {
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
    } catch {
      showToast('Download failed. Please try again.');
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <Header
        onOpenSidebar={openSidebar}
        title="Shortlisted Talent Dossier"
        subtitle="Manage, review resumes, and export candidate portfolios that your recruitment team has marked for campus interview rounds."
        actions={
          <div className="flex items-center gap-2">
            <Link to="/recruiter/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-stone-300 text-stone-800 hover:bg-[#FAF8F5] flex items-center gap-1.5 text-xs font-semibold"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Browse All Candidates
              </Button>
            </Link>
          </div>
        }
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172554] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-blue-900 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Shortlist Hero Stats */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F5EFE1] text-[#172554] flex items-center justify-center border border-[#E7E5E4] shadow-xs shrink-0">
              <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#FAF8F5] text-amber-800 border border-amber-200">
                  Priority Talent Pool
                </span>
                <span className="text-xs font-bold text-stone-900">
                  {shortlistedCandidates.length} Selected Candidates
                </span>
              </div>
              <h2 className="text-lg font-bold text-stone-900 mt-0.5 font-serif">
                Corporate Interview Shortlist
              </h2>
              <p className="text-xs text-stone-500">
                These students have been flagged for interview scheduling and technical assessment rounds.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={shortlistedCandidates.length === 0}
              className="bg-white border-stone-300 text-stone-800 hover:bg-[#FAF8F5] text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              Export Shortlist (CSV)
            </Button>
            {shortlistedCandidates.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllShortlist}
                className="bg-white border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Candidate Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : shortlistedCandidates.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No Candidates in Shortlist Yet"
            description="You haven't shortlisted any candidates yet. Browse the Recruiter Talent Pool and click the star icon or 'Shortlist' to save promising candidate dossiers here."
            actionLabel="Discover Candidates & Resumes"
            onAction={() => (window.location.href = '/recruiter/dashboard')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {shortlistedCandidates.map((student) => {
              const resume = student.resumes?.[0];
              const analysis = resume?.analyses?.[0];
              const score = analysis?.qualityScore;

              return (
                <Card
                  key={student.id}
                  className="bg-white border border-amber-300/80 shadow-xs ring-1 ring-amber-200/50 flex flex-col justify-between"
                >
                  <CardBody className="p-5 space-y-4">
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
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                          </div>
                          <span className="text-[11px] font-semibold text-stone-500 block mt-0.5">
                            {student.enrollmentNumber} • {student.graduationYear}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeShortlist(student.id, student.fullName)}
                        title="Remove from Shortlist"
                        className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="primary" size="sm">
                        {student.department}
                      </Badge>
                      <Badge variant="success" size="sm" className="font-bold">
                        CGPA {student.cgpa.toFixed(2)}
                      </Badge>
                      {score && (
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                          ATS {score}/100
                        </span>
                      )}
                    </div>

                    {resume && (
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-stone-800 font-semibold truncate">
                          <FileText className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                          <span className="truncate">{resume.originalName}</span>
                        </div>
                        <button
                          onClick={() => handleDownloadResume(resume, student.fullName)}
                          title="Download Resume"
                          className="p-1.5 rounded border border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1.5">
                        Extracted Skills
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(student.skills || []).slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold bg-[#FAF8F5] border border-stone-200 px-2 py-0.5 rounded text-stone-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setInspectingCandidate(student)}
                        className="flex-1 bg-[#172554] hover:bg-[#1E3A8A] text-white flex items-center justify-center gap-1.5 text-xs font-semibold py-2"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Full Dossier
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Candidate Dossier Quick Modal */}
      {inspectingCandidate && (
        <Modal
          isOpen={!!inspectingCandidate}
          onClose={() => setInspectingCandidate(null)}
          size="2xl"
          title={`Shortlisted Candidate: ${inspectingCandidate.fullName}`}
          footer={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setInspectingCandidate(null)}
              className="bg-[#172554] text-xs font-semibold"
            >
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">Department & Degree:</span>
                <span className="font-bold text-stone-900">{inspectingCandidate.department} • {inspectingCandidate.course}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">Enrollment Number:</span>
                <span className="font-bold text-stone-900">{inspectingCandidate.enrollmentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">Academic CGPA:</span>
                <span className="font-bold text-emerald-700">{inspectingCandidate.cgpa.toFixed(2)} / 10.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">Graduation Batch:</span>
                <span className="font-bold text-stone-900">{inspectingCandidate.graduationYear}</span>
              </div>
            </div>

            {inspectingCandidate.resumes?.[0]?.analyses?.[0] && (
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-1.5">
                <span className="font-bold text-emerald-900 uppercase text-[10px] tracking-wide block">
                  AI ATS Executive Evaluation
                </span>
                <p className="text-stone-700 leading-relaxed font-medium">
                  {inspectingCandidate.resumes[0].analyses[0].summary}
                </p>
              </div>
            )}

            <div>
              <span className="font-bold text-stone-700 block mb-1">Key Competencies:</span>
              <div className="flex flex-wrap gap-1.5">
                {(inspectingCandidate.skills || []).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-800 font-semibold text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
