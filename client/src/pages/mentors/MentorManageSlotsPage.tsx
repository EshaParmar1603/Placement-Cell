import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Plus,
  User,
  Star,
  FileText,
  CheckCircle2,
  AlertCircle,
  Video,
  ArrowLeft,
  Settings,
  Send,
  Download,
} from 'lucide-react';
import { mentorsApi } from '../../api/mentors';
import { resumesApi } from '../../api/resumes';
import { MentorBooking, MentorSlot } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';

export const MentorManageSlotsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<MentorBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Slot Modal
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotDate, setSlotDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:00');
  const [isSubmittingSlot, setIsSubmittingSlot] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  // Submit Feedback Modal
  const [activeFeedbackBooking, setActiveFeedbackBooking] = useState<MentorBooking | null>(null);
  const [technicalRating, setTechnicalRating] = useState(4);
  const [communicationRating, setCommunicationRating] = useState(4);
  const [problemSolvingRating, setProblemSolvingRating] = useState(4);
  const [overallRating, setOverallRating] = useState(4);
  const [summaryComments, setSummaryComments] = useState('');
  const [recommendation, setRecommendation] = useState('Recommended for Technical Rounds');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await mentorsApi.getMyBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load mentor bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotDate || !startTime || !endTime) {
      setSlotError('Please fill in all date and time fields.');
      return;
    }

    try {
      setIsSubmittingSlot(true);
      setSlotError(null);
      const res = await mentorsApi.createSlots([
        {
          slotDate,
          startTime,
          endTime,
        },
      ]);

      if (res.success) {
        setIsSlotModalOpen(false);
        setSlotDate('');
        fetchBookings();
      } else {
        setSlotError(res.message || 'Failed to create slot.');
      }
    } catch (err: any) {
      setSlotError(err.response?.data?.message || 'Error creating availability slot.');
    } finally {
      setIsSubmittingSlot(false);
    }
  };

  const handleOpenFeedback = (b: MentorBooking) => {
    setActiveFeedbackBooking(b);
    setTechnicalRating(b.feedback?.technicalRating || 4);
    setCommunicationRating(b.feedback?.communicationRating || 4);
    setProblemSolvingRating(b.feedback?.problemSolvingRating || 4);
    setOverallRating(b.feedback?.overallRating || 4);
    setSummaryComments(b.feedback?.summaryComments || '');
    setRecommendation(b.feedback?.recommendation || 'Recommended for Technical Rounds');
    setFeedbackError(null);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFeedbackBooking) return;

    try {
      setIsSubmittingFeedback(true);
      setFeedbackError(null);
      const res = await mentorsApi.submitFeedback(activeFeedbackBooking.id, {
        technicalRating,
        communicationRating,
        problemSolvingRating,
        overallRating,
        summaryComments,
        recommendation,
      });

      if (res.success) {
        setActiveFeedbackBooking(null);
        fetchBookings();
      } else {
        setFeedbackError(res.message || 'Failed to submit feedback.');
      }
    } catch (err: any) {
      setFeedbackError(err.response?.data?.message || 'Error saving interview feedback.');
    } finally {
      setIsSubmittingFeedback(false);
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/mentor-sessions')}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-600" />
              Mentor Workspace & Availability
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Open interview time slots for students and provide structured post-session evaluation feedback.
            </p>
          </div>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsSlotModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Availability Slot
        </Button>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Booked Sessions & Candidate Reviews */}
      <Card orientation="vertical" padding="lg">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Candidate Sessions & Feedback Requests ({bookings.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Bookings Yet"
            description="Create availability slots so students can discover you and schedule mock interviews."
            actionLabel="Add Availability Slot"
            onAction={() => setIsSlotModalOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              return (
                <div
                  key={booking.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      <User className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">
                          {booking.student?.fullName || 'Student'}
                        </h3>
                        <Badge
                          variant={
                            booking.status === 'CONFIRMED'
                              ? 'success'
                              : booking.status === 'COMPLETED'
                              ? 'info'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {booking.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {booking.student?.department} • Batch {booking.student?.graduationYear} • CGPA{' '}
                        {booking.student?.cgpa}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          {booking.slot?.slotDate
                            ? new Date(booking.slot.slotDate).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Date TBD'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {booking.slot?.startTime} – {booking.slot?.endTime}
                        </span>

                        {booking.resume && booking.consentGranted && (
                          <>
                            <span>•</span>
                            <button
                              onClick={() =>
                                handleDownloadResume(booking.resume!.id, booking.resume!.originalName)
                              }
                              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Resume v{booking.resume.version}
                            </button>
                          </>
                        )}
                      </div>

                      {booking.studentNotes && (
                        <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                          Candidate Note: "{booking.studentNotes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 md:self-center">
                    {booking.meetingUrl && booking.status === 'CONFIRMED' && (
                      <a
                        href={booking.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Call
                      </a>
                    )}

                    <Button
                      variant={booking.status === 'COMPLETED' ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleOpenFeedback(booking)}
                    >
                      <Star className="w-3.5 h-3.5 mr-1.5 text-amber-500 fill-amber-500" />
                      {booking.status === 'COMPLETED' ? 'Edit Evaluation' : 'Submit Evaluation'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Slot Modal */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title="Add Open Availability Slot"
        size="md"
      >
        <form onSubmit={handleCreateSlot} className="space-y-4">
          {slotError && <ErrorAlert message={slotError} onDismiss={() => setSlotError(null)} />}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Slot Date *
            </label>
            <input
              type="date"
              required
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                End Time *
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsSlotModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmittingSlot}>
              {isSubmittingSlot ? 'Saving...' : 'Add Slot'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submit Evaluation Modal */}
      {activeFeedbackBooking && (
        <Modal
          isOpen={!!activeFeedbackBooking}
          onClose={() => setActiveFeedbackBooking(null)}
          title={`Evaluate Mock Interview — ${activeFeedbackBooking.student?.fullName || 'Candidate'}`}
          size="lg"
        >
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            {feedbackError && <ErrorAlert message={feedbackError} onDismiss={() => setFeedbackError(null)} />}

            {/* Ratings Sliders/Selects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Technical Depth & Coding (1 - 5)
                </label>
                <select
                  value={technicalRating}
                  onChange={(e) => setTechnicalRating(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                >
                  <option value={5}>5 - Exceptional mastery</option>
                  <option value={4}>4 - Strong technical baseline</option>
                  <option value={3}>3 - Acceptable / Needs practice</option>
                  <option value={2}>2 - Major gaps in algorithms/architecture</option>
                  <option value={1}>1 - Inadequate fundamentals</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Communication & Articulation (1 - 5)
                </label>
                <select
                  value={communicationRating}
                  onChange={(e) => setCommunicationRating(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                >
                  <option value={5}>5 - Outstanding clarity & executive presence</option>
                  <option value={4}>4 - Articulate and structured</option>
                  <option value={3}>3 - Clear but lacked confidence/pace</option>
                  <option value={2}>2 - Struggled to explain thought process</option>
                  <option value={1}>1 - Unclear responses</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Problem Solving & Edge Cases (1 - 5)
                </label>
                <select
                  value={problemSolvingRating}
                  onChange={(e) => setProblemSolvingRating(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                >
                  <option value={5}>5 - Optimal logic & handled all edge cases</option>
                  <option value={4}>4 - Good analytical approach</option>
                  <option value={3}>3 - Solved with mentor guidance</option>
                  <option value={2}>2 - Missed edge cases & complexity</option>
                  <option value={1}>1 - Could not frame solution</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Overall Readiness Score (1 - 5)
                </label>
                <select
                  value={overallRating}
                  onChange={(e) => setOverallRating(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                >
                  <option value={5}>5 - Placement Ready (Tier 1 Companies)</option>
                  <option value={4}>4 - Well Prepared</option>
                  <option value={3}>3 - Moderately Prepared</option>
                  <option value={2}>2 - Requires 2-4 weeks study</option>
                  <option value={1}>1 - Needs comprehensive reboot</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Recommendation Verdict
              </label>
              <select
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                <option value="Strongly Recommended for Placement Drives">Strongly Recommended for Placement Drives</option>
                <option value="Recommended for Technical Rounds">Recommended for Technical Rounds</option>
                <option value="Borderline — Needs Dedicated DSA Revision">Borderline — Needs Dedicated DSA Revision</option>
                <option value="Not Recommended at Current Stage">Not Recommended at Current Stage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Feedback & Concrete Advice *
              </label>
              <textarea
                required
                rows={4}
                value={summaryComments}
                onChange={(e) => setSummaryComments(e.target.value)}
                placeholder="Specific feedback on algorithms, resume presentation, behavioural responses, and areas where candidate should focus..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setActiveFeedbackBooking(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={isSubmittingFeedback || !summaryComments.trim()}>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {isSubmittingFeedback ? 'Submitting...' : 'Submit Evaluation'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
