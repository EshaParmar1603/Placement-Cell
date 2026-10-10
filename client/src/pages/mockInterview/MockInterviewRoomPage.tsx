import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Award,
  AlertCircle,
  Lightbulb,
  Building,
  Target,
  RefreshCw,
  HelpCircle,
  Send,
  Check,
} from 'lucide-react';
import { mockInterviewsApi } from '../../api/mockInterviews';
import { MockInterviewSession } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { Skeleton } from '../../components/ui/Skeleton';

export const MockInterviewRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<MockInterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer in seconds
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        const res = await mockInterviewsApi.getSession(id);
        if (res.success && res.data) {
          setSession(res.data);
          // Set to first unanswered question if in progress
          if (res.data.status !== 'COMPLETED') {
            const firstUnanswered = res.data.questions.findIndex(
              (q) => q.studentAnswer === null || q.studentAnswer === undefined
            );
            if (firstUnanswered !== -1) {
              setCurrentQuestionIndex(firstUnanswered);
            }
          }
        } else {
          setError(res.message || 'Failed to load interview session.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error loading session.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  // Timer effect when interview is in progress
  useEffect(() => {
    if (session?.status !== 'IN_PROGRESS') return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [session?.status]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = session?.questions[currentQuestionIndex];

  // Update text area when switching questions
  useEffect(() => {
    if (currentQuestion?.studentAnswer) {
      setStudentAnswer(currentQuestion.studentAnswer);
    } else {
      setStudentAnswer('');
    }
  }, [currentQuestionIndex, currentQuestion]);

  const handleSubmitAnswer = async () => {
    if (!id || !currentQuestion || !studentAnswer.trim()) return;
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await mockInterviewsApi.submitAnswer(id, {
        questionNumber: currentQuestion.questionNumber,
        studentAnswer: studentAnswer.trim(),
      });

      if (res.success) {
        // Refresh session
        const updated = await mockInterviewsApi.getSession(id);
        if (updated.success && updated.data) {
          setSession(updated.data);
        }
      } else {
        setError(res.message || 'Failed to submit answer.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error submitting answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteInterview = async () => {
    if (!id) return;
    try {
      setIsCompleting(true);
      setError(null);
      const res = await mockInterviewsApi.completeSession(id);
      if (res.success && res.data) {
        setSession(res.data);
      } else {
        setError(res.message || 'Failed to complete interview.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error completing interview.');
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-4">
        <ErrorAlert message={error || 'Interview session not found.'} />
        <Button variant="outline" onClick={() => navigate('/mock-interviews')}>
          Back to Mock Interviews
        </Button>
      </div>
    );
  }

  const isCompleted = session.status === 'COMPLETED';
  const answeredCount = session.questions.filter((q) => q.score !== null && q.score !== undefined).length;
  const parsedQuestionFeedback = currentQuestion?.feedback
    ? typeof currentQuestion.feedback === 'string'
      ? (() => {
          try {
            return JSON.parse(currentQuestion.feedback);
          } catch {
            return { generalFeedback: currentQuestion.feedback };
          }
        })()
      : currentQuestion.feedback
    : null;

  return (
    <div className="space-y-6">
      {/* Session Header Bar */}
      <Card orientation="vertical" padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/mock-interviews')}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="Return to list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{session.companyName} Mock Interview</h1>
                <Badge variant={isCompleted ? 'success' : 'warning'} size="sm">
                  {session.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Role: <span className="font-semibold text-slate-700">{session.targetRole}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isCompleted && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-sm font-semibold">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>{formatTimer(secondsElapsed)}</span>
              </div>
            )}
            {!isCompleted && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleCompleteInterview}
                disabled={isCompleting || answeredCount === 0}
              >
                <Award className="w-4 h-4 mr-1.5" />
                {isCompleting ? 'Finishing...' : 'Complete Interview'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* If Completed: Comprehensive Scorecard Report */}
      {isCompleted ? (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <Card orientation="vertical" padding="lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative flex items-center justify-center">
                  <div
                    className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 ${
                      (session.overallScore || 0) >= 75
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : (session.overallScore || 0) >= 50
                        ? 'border-amber-500 bg-amber-50 text-amber-800'
                        : 'border-rose-500 bg-rose-50 text-rose-800'
                    }`}
                  >
                    <span className="text-3xl font-extrabold">{session.overallScore}%</span>
                    <span className="text-xs uppercase tracking-wider font-semibold">Overall</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Interview Evaluation Completed
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 max-w-xl">
                    {session.feedback?.summary ||
                      `Performance report for ${session.targetRole} interview simulation at ${session.companyName}.`}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Completed at: {session.completedAt ? new Date(session.completedAt).toLocaleString() : 'Just now'}
                  </p>
                </div>
              </div>

              <Button variant="outline" size="md" onClick={() => navigate('/mock-interviews')}>
                Start Another Session
              </Button>
            </div>
          </Card>

          {/* Rubrics Metrics Grid */}
          {session.rubrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card orientation="vertical" padding="md">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Technical Competency
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {session.rubrics.technicalCompetency}%
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar progress={session.rubrics.technicalCompetency} color="indigo" size="sm" />
                </div>
              </Card>

              <Card orientation="vertical" padding="md">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Communication Clarity
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {session.rubrics.communicationClarity}%
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar progress={session.rubrics.communicationClarity} color="emerald" size="sm" />
                </div>
              </Card>

              <Card orientation="vertical" padding="md">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Problem Solving Rigor
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {session.rubrics.problemSolving}%
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar progress={session.rubrics.problemSolving} color="purple" size="sm" />
                </div>
              </Card>
            </div>
          )}

          {/* Strengths & Improvement Areas */}
          {session.feedback && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card orientation="vertical" padding="md" className="border-l-4 border-l-emerald-500">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Strengths
                </h3>
                <ul className="space-y-2">
                  {session.feedback.strengths?.map((s: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card orientation="vertical" padding="md" className="border-l-4 border-l-amber-500">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3 text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Areas for Growth & Preparation
                </h3>
                <ul className="space-y-2">
                  {session.feedback.improvementAreas?.map((imp: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {/* Question by Question Review */}
          <Card orientation="vertical" padding="lg">
            <h3 className="font-bold text-slate-900 text-base mb-4">Complete Question-by-Question Review</h3>
            <div className="space-y-6">
              {session.questions.map((q) => {
                let qFb: any = null;
                try {
                  qFb = q.feedback ? (typeof q.feedback === 'string' ? JSON.parse(q.feedback) : q.feedback) : null;
                } catch {
                  qFb = { generalFeedback: q.feedback };
                }

                return (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold text-xs">
                          Q{q.questionNumber}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                          {q.category}
                        </span>
                      </div>
                      {q.score !== null && (
                        <span className="font-black text-sm px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {q.score} / 10
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-900">{q.questionText}</p>

                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-600 block mb-1">Your Submitted Answer:</span>
                      <p className="text-slate-800 whitespace-pre-wrap">{q.studentAnswer || '(No answer provided)'}</p>
                    </div>

                    {qFb && (
                      <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs space-y-1.5">
                        <span className="font-bold text-indigo-900 block flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          AI Feedback:
                        </span>
                        <p className="text-slate-700">{qFb.generalFeedback}</p>
                        {qFb.modelAnswerOutline && (
                          <div className="pt-1.5 border-t border-indigo-100 text-slate-600">
                            <span className="font-semibold text-indigo-800">Recommended Model Answer Points: </span>
                            {qFb.modelAnswerOutline}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      ) : (
        /* In Progress Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Stepper Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <Card orientation="vertical" padding="md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h3 className="font-bold text-slate-900 text-sm">Session Questions</h3>
                <span className="text-xs font-semibold text-slate-500">
                  {answeredCount} / {session.questions.length} Answered
                </span>
              </div>

              <div className="space-y-2">
                {session.questions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIndex;
                  const isAnswered = q.score !== null && q.score !== undefined;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-full p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'border-indigo-600 bg-indigo-50/50 font-bold text-indigo-900 shadow-sm'
                          : isAnswered
                          ? 'border-emerald-200 bg-emerald-50/30 text-slate-700 hover:bg-slate-50'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isAnswered ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-500">
                            {q.questionNumber}
                          </div>
                        )}
                        <span className="truncate max-w-[150px]">
                          Q{q.questionNumber}: {q.category}
                        </span>
                      </div>

                      {isAnswered && (
                        <span className="font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                          {q.score}/10
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>

            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                Interview Tips
              </p>
              <p className="text-indigo-800">
                Structure your technical response with problem definition, approach trade-offs, space/time complexity, and testing.
              </p>
            </div>
          </div>

          {/* Active Question Workspace */}
          <div className="lg:col-span-8 space-y-6">
            {currentQuestion ? (
              <Card orientation="vertical" padding="lg">
                {/* Question Info Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-800 font-extrabold text-xs">
                      Question {currentQuestion.questionNumber} of {session.questions.length}
                    </span>
                    {currentQuestion.topic && (
                      <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider">
                        {currentQuestion.topic}
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold text-xs">
                      {currentQuestion.category}
                    </span>
                  </div>

                  {currentQuestion.score !== null && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">Score:</span>
                      <span className="px-2.5 py-0.5 rounded font-black text-xs bg-emerald-100 text-emerald-800">
                        {currentQuestion.score} / 10
                      </span>
                    </div>
                  )}
                </div>

                {/* Prompt */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-5">
                  <h3 className="font-semibold text-slate-900 text-sm leading-relaxed">
                    {currentQuestion.questionText}
                  </h3>
                </div>

                {/* Answer Input Area */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Your Detailed Response:
                    </label>
                    <span className="text-xs text-slate-400 font-mono">
                      {studentAnswer.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    placeholder="Type your explanation, algorithm steps, edge cases, and reasoning here..."
                    className="w-full p-3.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-normal text-slate-800 placeholder-slate-400"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSubmitAnswer}
                      disabled={isSubmitting || !studentAnswer.trim()}
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      {isSubmitting ? 'Evaluating...' : currentQuestion.score !== null ? 'Update Answer' : 'Submit Answer'}
                    </Button>

                    {currentQuestionIndex < session.questions.length - 1 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      >
                        Next
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Feedback Box for current question if answered */}
                {parsedQuestionFeedback && (
                  <div className="mt-6 p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        AI Immediate Feedback ({currentQuestion.score}/10)
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                      {parsedQuestionFeedback.generalFeedback}
                    </p>

                    {parsedQuestionFeedback.strengths && (
                      <div className="pt-2 border-t border-indigo-100">
                        <span className="font-semibold text-emerald-800 block mb-1">Demonstrated Strengths:</span>
                        <ul className="space-y-1">
                          {parsedQuestionFeedback.strengths.map((s: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-1.5 text-slate-700">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {parsedQuestionFeedback.improvements && (
                      <div className="pt-2 border-t border-indigo-100">
                        <span className="font-semibold text-amber-800 block mb-1">Key Improvements Needed:</span>
                        <ul className="space-y-1">
                          {parsedQuestionFeedback.improvements.map((imp: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-1.5 text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
