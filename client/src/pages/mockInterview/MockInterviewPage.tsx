import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Tag,
  Eye,
  Trash2,
  HelpCircle,
  Users,
} from 'lucide-react';
import { mockInterviewsApi } from '../../api/mockInterviews';
import { resumesApi } from '../../api/resumes';
import { companiesApi } from '../../api/companies';
import { MockInterviewSession, Resume, Company, ScheduledAiInterview } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { Skeleton } from '../../components/ui/Skeleton';
import { ScheduleAiInterviewModal } from '../../components/mockInterview/ScheduleAiInterviewModal';
import { useAuth } from '../../context/AuthContext';

export const MockInterviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [history, setHistory] = useState<MockInterviewSession[]>([]);
  const [scheduledTests, setScheduledTests] = useState<ScheduledAiInterview[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab switcher: Scheduled tests vs Individual Practice
  const [activeTab, setActiveTab] = useState<'SCHEDULED' | 'PRACTICE'>('SCHEDULED');

  // Schedule Test Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Inspect Test Questions Modal State
  const [inspectingTest, setInspectingTest] = useState<ScheduledAiInterview | null>(null);

  // Student Self Practice Modal State
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [targetCompany, setTargetCompany] = useState('Google');
  const [targetRole, setTargetRole] = useState('Software Development Engineer');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Check query parameter for ?schedule=true
  useEffect(() => {
    if (searchParams.get('schedule') === 'true') {
      setIsScheduleModalOpen(true);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [historyRes, scheduledRes, resumesRes, companiesRes] = await Promise.all([
        mockInterviewsApi.getHistory(),
        mockInterviewsApi.getScheduledAiInterviews(),
        resumesApi.getMyResumes(),
        companiesApi.listCompanies(),
      ]);

      if (historyRes.success && historyRes.data) {
        setHistory(historyRes.data);
      }
      if (scheduledRes.success && scheduledRes.data) {
        setScheduledTests(scheduledRes.data);
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

  useEffect(() => {
    fetchData();
  }, []);

  // Launch scheduled assessment test
  const handleTakeScheduledTest = async (scheduledId: string) => {
    try {
      setIsStarting(true);
      const res = await mockInterviewsApi.startScheduledSession(scheduledId);
      if (res.success && res.data) {
        navigate(`/mock-interviews/${res.data.id}`);
      } else {
        setError(res.message || 'Failed to launch scheduled assessment.');
      }
    } catch (err: any) {
      setError('Error initializing assessment test.');
    } finally {
      setIsStarting(false);
    }
  };

  // Delete scheduled test
  const handleDeleteScheduledTest = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this scheduled AI assessment?')) return;
    try {
      await mockInterviewsApi.deleteScheduledAiInterview(id);
      fetchData();
    } catch {
      // ignore
    }
  };

  // Start self-practice interview
  const handleStartPracticeInterview = async (e: React.FormEvent) => {
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
        setIsPracticeModalOpen(false);
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
            AI Mock Interview & Assessment Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Faculty & mentor topic-tailored tests, multi-round technical simulations, and automated scoring rubrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Primary Action: Schedule AI Assessment (for Mentor / Faculty / Admin) */}
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsScheduleModalOpen(true)}
            className="bg-[#172554] hover:bg-[#1E3A8A] text-white shadow-xs font-bold"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-amber-300" />
            Schedule AI Assessment
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => setIsPracticeModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Self Practice
          </Button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Tabs: Faculty Scheduled Tests vs Practice Tracks */}
      <div className="flex items-center border-b border-stone-200">
        <button
          onClick={() => setActiveTab('SCHEDULED')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'SCHEDULED'
              ? 'border-[#172554] text-[#172554] bg-[#F5EFE1]/40'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Faculty & Mentor Scheduled Tests</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#172554] text-white">
            {scheduledTests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PRACTICE')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'PRACTICE'
              ? 'border-[#172554] text-[#172554] bg-[#F5EFE1]/40'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Building className="w-4 h-4 text-stone-500" />
          <span>Company Practice Tracks (Google / MS / Amazon)</span>
        </button>
      </div>

      {/* TAB 1: FACULTY & MENTOR SCHEDULED ASSESSMENTS */}
      {activeTab === 'SCHEDULED' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Upcoming AI Evaluated Tests
              </h2>
              <p className="text-xs text-slate-500">
                Created by faculty & corporate mentors with topic-specific questions (e.g. HTML, CSS, JavaScript).
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScheduleModalOpen(true)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Test
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-44 w-full" />
            </div>
          ) : scheduledTests.length === 0 ? (
            <EmptyState
              icon={BrainCircuit}
              title="No Faculty Assessments Scheduled"
              description="Faculty and mentors can schedule tests with AI-generated questions tailored to specific topics."
              actionLabel="Schedule AI Assessment"
              onAction={() => setIsScheduleModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {scheduledTests.map((test) => (
                <Card
                  key={test.id}
                  padding="md"
                  className="bg-white border border-stone-200 hover:border-indigo-300 hover:shadow-xs transition-all relative"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          test.difficulty === 'ENTRY'
                            ? 'success'
                            : test.difficulty === 'ADVANCED'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {test.difficulty}
                      </Badge>
                      <Badge variant="primary" size="sm">
                        {test.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        onClick={() => setInspectingTest(test)}
                        title="View Questions & Rubric"
                        className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteScheduledTest(test.id)}
                        title="Delete Assessment"
                        className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">
                    {test.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target: <strong>{test.targetAudience}</strong></span>
                  </div>

                  {/* Topic Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                    {test.topics.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#FAF8F5] text-[#172554] border border-stone-200"
                      >
                        <Tag className="w-2.5 h-2.5 text-amber-600" />
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100 text-xs mb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Time</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {test.scheduledDate} {test.scheduledTime}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {test.durationMinutes} Mins
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        {test.questions.length} Qs ({test.questions.length * 10} Pts)
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      By {test.creatorName}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInspectingTest(test)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Inspect Rubric
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleTakeScheduledTest(test.id)}
                        disabled={isStarting}
                        className="bg-[#172554] hover:bg-[#1E3A8A] text-white"
                      >
                        <Play className="w-3.5 h-3.5 mr-1" />
                        Take Assessment
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPANY SELF-PRACTICE TRACKS */}
      {activeTab === 'PRACTICE' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card padding="md" className="bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100">
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
                    setIsPracticeModalOpen(true);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Practice <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>

            <Card padding="md" className="bg-gradient-to-br from-blue-50/50 to-white border-blue-100">
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
                    setIsPracticeModalOpen(true);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  Practice <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>

            <Card padding="md" className="bg-gradient-to-br from-purple-50/50 to-white border-purple-100">
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
                    setIsPracticeModalOpen(true);
                  }}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  Practice <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Previous Sessions History Table */}
      <Card padding="lg">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Previous Interview & Test Attempts ({history.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={BrainCircuit}
            title="No Interviews Attempted Yet"
            description="Launch your first AI mock interview session or take a scheduled faculty assessment."
            actionLabel="Start Interview"
            onAction={() => setIsPracticeModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Target Role & Assessment</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Questions Answered</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Overall Score</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700">Date Attempted</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((session) => {
                  const answeredCount =
                    session.questions?.filter((q) => q.score !== null && q.score !== undefined).length || 0;
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

      {/* SCHEDULE AI INTERVIEW MODAL (The requested core feature) */}
      <ScheduleAiInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSuccess={() => {
          fetchData();
          setActiveTab('SCHEDULED');
        }}
      />

      {/* INSPECT QUESTIONS & RUBRICS MODAL */}
      {inspectingTest && (
        <Modal
          isOpen={!!inspectingTest}
          onClose={() => setInspectingTest(null)}
          title={`Syllabus & Rubrics: ${inspectingTest.title}`}
          subtitle={`Created by ${inspectingTest.creatorName} • ${inspectingTest.questions.length} Questions`}
          size="2xl"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">Target Batch</span>
                <span className="font-semibold text-slate-800">{inspectingTest.targetAudience}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">Topics</span>
                <div className="flex gap-1 mt-0.5">
                  {inspectingTest.topics.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">Schedule</span>
                <span className="font-semibold text-slate-800">
                  {inspectingTest.scheduledDate} ({inspectingTest.durationMinutes}m)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {inspectingTest.questions.map((q, idx) => (
                <div key={q.id || idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                      Question {idx + 1} • {q.topic || 'General'}
                    </span>
                    <Badge variant={q.difficulty === 'EASY' ? 'success' : q.difficulty === 'HARD' ? 'danger' : 'warning'} size="sm">
                      {q.difficulty || 'MEDIUM'}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{q.questionText}</p>

                  {q.expectedAnswer && (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-700">
                      <strong className="text-slate-900 block mb-0.5">Expected Answer Outline:</strong>
                      {q.expectedAnswer}
                    </div>
                  )}

                  {q.evaluationCriteria && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>AI Evaluation Criteria:</strong> {q.evaluationCriteria}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setInspectingTest(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const testId = inspectingTest.id;
                  setInspectingTest(null);
                  handleTakeScheduledTest(testId);
                }}
                className="bg-[#172554] hover:bg-[#1E3A8A] text-white"
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                Launch Test Now
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* SELF-PRACTICE INTERVIEW MODAL */}
      <Modal
        isOpen={isPracticeModalOpen}
        onClose={() => setIsPracticeModalOpen(false)}
        title="Start AI Mock Practice Session"
        size="md"
      >
        <form onSubmit={handleStartPracticeInterview} className="space-y-4">
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
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsPracticeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isStarting}>
              <Play className="w-3.5 h-3.5 mr-1.5" />
              {isStarting ? 'Generating Session...' : 'Start Practice'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
