import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Tag,
  AlertCircle,
  BrainCircuit,
  Wand2,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ErrorAlert } from '../ui/ErrorAlert';
import { mockInterviewsApi } from '../../api/mockInterviews';
import { InterviewQuestionItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ScheduleAiInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_TOPIC_PACKS = [
  {
    name: 'HTML, CSS & JavaScript',
    topics: ['HTML', 'CSS', 'JavaScript'],
    title: 'Faculty Technical Screening: HTML, CSS & Modern JavaScript',
    difficulty: 'INTERMEDIATE' as const,
    duration: 45,
  },
  {
    name: 'React & Frontend Core',
    topics: ['React', 'JavaScript', 'CSS'],
    title: 'Frontend Developer Round: React & State Architecture',
    difficulty: 'INTERMEDIATE' as const,
    duration: 45,
  },
  {
    name: 'Python & Data Structures',
    topics: ['Python', 'DSA'],
    title: 'Python Programming & Problem Solving Round',
    difficulty: 'INTERMEDIATE' as const,
    duration: 60,
  },
  {
    name: 'SQL & Database Design',
    topics: ['SQL', 'System Design'],
    title: 'Database Architecture & SQL Optimization Assessment',
    difficulty: 'ADVANCED' as const,
    duration: 45,
  },
];

export const ScheduleAiInterviewModal: React.FC<ScheduleAiInterviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  // Test setup form state
  const [title, setTitle] = useState('Faculty Screening: HTML, CSS & Modern JavaScript Assessment');
  const [targetAudience, setTargetAudience] = useState('All Final Year B.Tech CSE & IT Students');
  const [topics, setTopics] = useState<string[]>(['HTML', 'CSS', 'JavaScript']);
  const [newTopicInput, setNewTopicInput] = useState('');
  const [difficulty, setDifficulty] = useState<'ENTRY' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [scheduledDate, setScheduledDate] = useState('2026-10-15');
  const [scheduledTime, setScheduledTime] = useState('11:00 AM');
  const [instructions, setInstructions] = useState(
    'Answer all questions thoroughly with technical code syntax and architectural principles. Evaluated using Google & NVIDIA campus hiring benchmarks.'
  );

  // Question list state
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual Question Addition state
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [customQuestionText, setCustomQuestionText] = useState('');
  const [customQuestionTopic, setCustomQuestionTopic] = useState('JavaScript');
  const [customDifficulty, setCustomDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [customCriteria, setCustomCriteria] = useState('');
  const [customExpectedAnswer, setCustomExpectedAnswer] = useState('');

  // Handle Preset Pack Selection
  const handleSelectPreset = (preset: typeof PRESET_TOPIC_PACKS[0]) => {
    setTitle(preset.title);
    setTopics([...preset.topics]);
    setDifficulty(preset.difficulty);
    setDurationMinutes(preset.duration);
    // Auto-generate AI questions for the preset
    handleGenerateAiQuestions(preset.topics, preset.difficulty);
  };

  // Add custom topic tag
  const handleAddTopic = () => {
    const trimmed = newTopicInput.trim();
    if (trimmed && !topics.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTopics([...topics, trimmed]);
      setNewTopicInput('');
    }
  };

  // Remove topic tag
  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter((t) => t !== topicToRemove));
  };

  // Generate Questions with AI
  const handleGenerateAiQuestions = async (activeTopics = topics, activeDiff = difficulty) => {
    if (activeTopics.length === 0) {
      setError('Please add at least one topic (e.g. HTML, CSS, JavaScript).');
      return;
    }

    try {
      setIsGeneratingAi(true);
      setError(null);
      const res = await mockInterviewsApi.generateAiQuestions({
        topics: activeTopics,
        difficulty: activeDiff,
        count: 4,
      });

      if (res.success && res.data) {
        setQuestions(res.data);
      }
    } catch (err: any) {
      setError('Failed to generate AI questions. You can add questions manually below.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Add custom question manually
  const handleAddCustomQuestion = () => {
    if (!customQuestionText.trim()) {
      setError('Please enter the question text.');
      return;
    }

    const newQ: InterviewQuestionItem = {
      id: `manual-q-${Date.now()}`,
      questionNumber: questions.length + 1,
      category: 'TECHNICAL',
      topic: customQuestionTopic || topics[0] || 'Web Development',
      difficulty: customDifficulty,
      maxScore: 10,
      questionText: customQuestionText.trim(),
      expectedAnswer: customExpectedAnswer.trim() || undefined,
      evaluationCriteria: customCriteria.trim() || undefined,
    };

    setQuestions([...questions, newQ]);
    setCustomQuestionText('');
    setCustomCriteria('');
    setCustomExpectedAnswer('');
    setShowManualAdd(false);
    setError(null);
  };

  // Delete question
  const handleDeleteQuestion = (id: string) => {
    const filtered = questions.filter((q) => q.id !== id);
    // renumber
    const renumbered = filtered.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    setQuestions(renumbered);
  };

  // Update question text inline
  const handleUpdateQuestionText = (id: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, questionText: text } : q)));
  };

  // Final Submit
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a test title.');
      return;
    }
    if (topics.length === 0) {
      setError('Please specify at least one topic.');
      return;
    }
    if (questions.length === 0) {
      setError('Please click "AI Suggest Questions" or add custom questions before scheduling.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const creatorName =
        user?.managerProfile?.fullName ||
        user?.mentorProfile?.fullName ||
        user?.email?.split('@')[0] ||
        'Faculty / Placement Officer';

      const creatorRole =
        (user?.role === 'MENTOR' ? 'MENTOR' : 'PLACEMENT_MANAGER') as 'MENTOR' | 'PLACEMENT_MANAGER';

      const res = await mockInterviewsApi.scheduleAiInterview({
        title: title.trim(),
        creatorId: user?.id || 'mgr-1',
        creatorName,
        creatorRole,
        targetAudience: targetAudience.trim() || 'All Students',
        topics,
        difficulty,
        durationMinutes,
        scheduledDate,
        scheduledTime,
        instructions: instructions.trim(),
        questions,
        status: 'ACTIVE',
        totalQuestions: questions.length,
      });

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || 'Failed to schedule interview test.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error scheduling assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">
              Schedule Faculty & Mentor AI Assessment
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Create an AI-evaluated mock test with topic-tailored questions & rubrics
            </p>
          </div>
        </div>
      }
      size="3xl"
    >
      <form onSubmit={handleScheduleSubmit} className="space-y-5">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {/* 1-Click Topic Presets */}
        <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-amber-700" />
              Quick Topic Presets (1-Click Syllabus Setup)
            </span>
            <span className="text-[10px] text-stone-500 font-medium">Click to populate</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_TOPIC_PACKS.map((preset) => (
              <button
                type="button"
                key={preset.name}
                onClick={() => handleSelectPreset(preset)}
                className="text-left p-2 rounded-lg bg-white border border-stone-200 hover:border-indigo-400 hover:shadow-xs transition-all text-xs"
              >
                <div className="font-bold text-slate-800 truncate">{preset.name}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {preset.topics.join(' • ')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Basic Details */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          <div className="sm:col-span-8">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assessment Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Faculty Screening: HTML, CSS & Modern JavaScript Test"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Target Candidates / Batch
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. All Final Year CSE / Specific Student"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>
        </div>

        {/* Topics / Skills Selector (The Core User Request!) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Test Topics & Syllabus * (e.g. HTML, CSS, JavaScript)
            </label>
            <span className="text-[11px] text-indigo-600 font-medium">
              AI will generate questions specific to these topics
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            {/* Active Topic Tags */}
            <div className="flex flex-wrap items-center gap-1.5 min-h-[30px]">
              {topics.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  <Tag className="w-3 h-3" />
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(t)}
                    className="hover:text-red-600 ml-0.5 text-xs font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}

              {topics.length === 0 && (
                <span className="text-xs text-slate-400 italic">No topics selected yet. Add below.</span>
              )}
            </div>

            {/* Topic Input + Add Button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTopicInput}
                onChange={(e) => setNewTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
                placeholder="Type a topic (e.g. TypeScript, SQL, React) and press Enter..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTopic}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Topic
              </Button>
            </div>
          </div>
        </div>

        {/* Schedule & Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Time *
            </label>
            <input
              type="text"
              required
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              placeholder="e.g. 11:00 AM"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Duration
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            >
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
              <option value={90}>90 Minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            >
              <option value="ENTRY">Entry Level (Junior)</option>
              <option value="INTERMEDIATE">Intermediate (Standard)</option>
              <option value="ADVANCED">Advanced (Senior)</option>
            </select>
          </div>
        </div>

        {/* AI Question Suggester Section */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Assessment Questions ({questions.length})
              </h4>
              <p className="text-[11px] text-slate-500">
                Generate questions with Gemini / DeepSeek AI based on selected topics, or write your own.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleGenerateAiQuestions()}
                disabled={isGeneratingAi}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                {isGeneratingAi ? 'Generating Questions...' : '✨ AI Suggest Questions'}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowManualAdd(!showManualAdd)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                + Add Custom Question
              </Button>
            </div>
          </div>

          {/* Manual Custom Question Addition Form */}
          {showManualAdd && (
            <div className="mb-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Create Custom Question
                </span>
                <button
                  type="button"
                  onClick={() => setShowManualAdd(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Question Text *
                </label>
                <textarea
                  rows={2}
                  required
                  value={customQuestionText}
                  onChange={(e) => setCustomQuestionText(e.target.value)}
                  placeholder="e.g. Explain how CSS specificity works and what happens when an !important rule conflicts with inline styles."
                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Topic</label>
                  <input
                    type="text"
                    value={customQuestionTopic}
                    onChange={(e) => setCustomQuestionTopic(e.target.value)}
                    placeholder="e.g. JavaScript, CSS, HTML"
                    className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={customDifficulty}
                    onChange={(e) => setCustomDifficulty(e.target.value as any)}
                    className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Expected Key Concepts
                  </label>
                  <input
                    type="text"
                    value={customCriteria}
                    onChange={(e) => setCustomCriteria(e.target.value)}
                    placeholder="e.g. Mention 1000/100/10/1 weighting"
                    className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button type="button" variant="primary" size="sm" onClick={handleAddCustomQuestion}>
                  Save Question to Assessment
                </Button>
              </div>
            </div>
          )}

          {/* Generated Question Cards */}
          {questions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              <BrainCircuit className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No Questions Added Yet</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click <strong>"✨ AI Suggest Questions"</strong> above to instantly generate questions for{' '}
                <strong>{topics.join(', ') || 'your selected topics'}</strong>.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <Badge variant="primary" size="sm" className="text-[10px] uppercase font-bold">
                        {q.topic || 'General'}
                      </Badge>
                      <Badge
                        variant={
                          q.difficulty === 'EASY'
                            ? 'success'
                            : q.difficulty === 'HARD'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                        className="text-[10px]"
                      >
                        {q.difficulty || 'MEDIUM'}
                      </Badge>
                      <span className="text-[10px] font-semibold text-slate-400">10 Marks</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Remove Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={q.questionText}
                    onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                    className="w-full text-xs text-slate-800 font-medium bg-transparent border-0 p-0 focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded resize-none"
                  />

                  {q.evaluationCriteria && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-500">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>
                        <strong className="text-slate-700">AI Evaluation Criteria:</strong>{' '}
                        {q.evaluationCriteria}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <strong>{questions.length} Questions</strong> • {questions.length * 10} Total Marks • {durationMinutes} Mins
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSubmitting || questions.length === 0}
              className="bg-[#172554] hover:bg-[#1E3A8A] text-white shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              {isSubmitting ? 'Scheduling...' : 'Confirm & Schedule AI Assessment'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
