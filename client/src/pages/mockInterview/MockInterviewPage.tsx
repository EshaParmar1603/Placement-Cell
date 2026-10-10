import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Plus,
  Play,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Building,
  Target,
  BookOpen,
} from 'lucide-react';
import { mockInterviewsApi } from '../../api/mockInterviews';
import { resumesApi } from '../../api/resumes';
import { companiesApi } from '../../api/companies';
import { MockInterviewSession, Resume, Company } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { Skeleton } from '../../components/ui/Skeleton';

export const MockInterviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<MockInterviewSession[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Interview Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetCompany, setTargetCompany] = useState('Google');
  const [targetRole, setTargetRole] = useState('Software Development Engineer');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [historyRes, resumesRes, companiesRes] = await Promise.all([
          mockInterviewsApi.getHistory(),
          resumesApi.getMyResumes(),
          companiesApi.listCompanies(),
        ]);

        if (historyRes.success && historyRes.data) {
          setHistory(historyRes.data);
        }
        if (resumesRes.success && resumesRes.data) {
          setResumes(resumesRes.data);
          if (resumesRes.data.length > 0) {
            setSelectedResumeId(resumesRes.data[0].id);
          }
        }
        if (companiesRes.success && companiesRes.data) {
          setCompanies(companiesRes.data);
          if (companiesRes.data.length > 0) {
            setTargetCompany(companiesRes.data[0].name);
          }
        }
      } catch (err: any) {
        setError('Failed to load mock interview data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsStarting(true);
      setModalError(null);
      const res = await mockInterviewsApi.startSession({
        companyName: targetCompany,
        targetRole,
        resumeId: selectedResumeId || undefined,
      });

      if (res.success && res.data) {
        setIsModalOpen(false);
        navigate(`/mock-interviews/${res.data.id}`);
      } else {
        setModalError(res.message || 'Failed to start interview.');
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Error initializing mock interview session.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-600" />
            AI Mock Interviews
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Simulate realistic multi-round technical and behavioral interviews tailored to your target company and resume.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Start New Mock Interview
        </Button>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Target Company Track Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card orientation="vertical" padding="md" className="bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Company Track</span>
            <Building className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Google SDE Track</h3>
          <p className="text-xs text-slate-500 mt-1">
            Algorithms, Distributed System Fundamentals, and Problem Solving rigor.
          </p>
          <div className="mt-4 pt-3 border-t border-indigo-100/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">4 Tailored Questions</span>
            <button
              onClick={() => {
                setTargetCompany('Google');
                setTargetRole('Software Engineer');
                setIsModalOpen(true);
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Practice <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>

        <Card orientation="vertical" padding="md" className="bg-gradient-to-br from-blue-50/50 to-white border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Company Track</span>
            <Building className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Microsoft SWE Track</h3>
          <p className="text-xs text-slate-500 mt-1">
            Object-Oriented Design, Cloud Architecture, and Project Deep Dives.
          </p>
          <div className="mt-4 pt-3 border-t border-blue-100/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">4 Tailored Questions</span>
            <button
              onClick={() => {
                setTargetCompany('Microsoft');
                setTargetRole('Software Engineer');
                setIsModalOpen(true);
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Practice <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>

        <Card orientation="vertical" padding="md" className="bg-gradient-to-br from-purple-50/50 to-white border-purple-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Company Track</span>
            <Building className="w-4 h-4 text-purple-500" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Amazon SDE Track</h3>
          <p className="text-xs text-slate-500 mt-1">
            Leadership Principles, Scalability, and Code Optimization Scenarios.
          </p>
          <div className="mt-4 pt-3 border-t border-purple-100/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">4 Tailored Questions</span>
            <button
              onClick={() => {
                setTargetCompany('Amazon');
                setTargetRole('Software Development Engineer');
                setIsModalOpen(true);
              }}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              Practice <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>
      </div>

      {/* Previous Sessions History Table */}
      <Card orientation="vertical" padding="lg">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Previous Interview Attempts ({history.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={BrainCircuit}
            title="No Interviews Attempted Yet"
            description="Launch your first AI mock interview session to receive live scoring and structured rubric feedback."
            actionLabel="Start Interview"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Target Role & Company</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Questions Answered</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Overall Score</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Date Attempted</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((session) => {
                  const answeredCount = session.questions?.filter((q) => q.score !== null && q.score !== undefined).length || 0;
                  const totalQuestions = session.questions?.length || 4;

                  return (
                    <tr key={session.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{session.companyName}</div>
                        <div className="text-[11px] text-slate-500">{session.targetRole}</div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={session.status === 'COMPLETED' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {session.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {answeredCount} / {totalQuestions}
                      </td>
                      <td className="py-3 px-3">
                        {session.overallScore !== undefined && session.overallScore !== null ? (
                          <span
                            className={`font-black text-sm px-2 py-0.5 rounded ${
                              session.overallScore >= 75
                                ? 'bg-emerald-100 text-emerald-800'
                                : session.overallScore >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {session.overallScore}%
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">In progress</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(session.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant={session.status === 'COMPLETED' ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => navigate(`/mock-interviews/${session.id}`)}
                        >
                          {session.status === 'COMPLETED' ? 'View Report' : 'Resume Session'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Start Interview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Start AI Mock Interview Session"
        size="md"
      >
        <form onSubmit={handleStartInterview} className="space-y-4">
          {modalError && <ErrorAlert message={modalError} onDismiss={() => setModalError(null)} />}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Company
            </label>
            <input
              type="text"
              required
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="e.g. Google, Microsoft, Amazon"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Job Role
            </label>
            <input
              type="text"
              required
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Software Development Engineer, Data Analyst"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Resume to Contextualize Questions (Optional)
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            >
              <option value="">No specific resume (General questions)</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  v{r.version} — {r.originalName}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Selecting a resume allows the AI to tailor project and technical questions to your actual background.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isStarting}>
              <Play className="w-3.5 h-3.5 mr-1.5" />
              {isStarting ? 'Generating Session...' : 'Start Interview'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
