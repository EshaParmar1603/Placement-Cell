import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  User,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Star,
  ExternalLink,
  Ban,
} from 'lucide-react';
import { mentorsApi } from '../../api/mentors';
import { MentorBooking } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';

export const MyMentorBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<MentorBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation Modal
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Feedback View Modal
  const [viewingFeedback, setViewingFeedback] = useState<MentorBooking | null>(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await mentorsApi.getMyBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingBookingId) return;

    try {
      setIsCancelling(true);
      setCancelError(null);
      const res = await mentorsApi.cancelBooking(cancellingBookingId, cancelReason);
      if (res.success) {
        setCancellingBookingId(null);
        setCancelReason('');
        fetchBookings();
      } else {
        setCancelError(res.message || 'Failed to cancel booking.');
      }
    } catch (err: any) {
      setCancelError(err.response?.data?.message || 'Error cancelling booking.');
    } finally {
      setIsCancelling(false);
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
              <Calendar className="w-6 h-6 text-indigo-600" />
              My Mentor Sessions
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Track your scheduled 1:1 sessions, access meeting links, and review mentor evaluations.
            </p>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={() => navigate('/mentor-sessions')}>
          Discover Mentors
        </Button>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Bookings List */}
      <Card orientation="vertical" padding="lg">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Booked Sessions"
            description="You don't have any mentor sessions booked. Browse the directory to find mentors and pick open slots."
            actionLabel="Browse Mentor Directory"
            onAction={() => navigate('/mentor-sessions')}
          />
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isStudent = user?.role === 'STUDENT';
              const otherPartyName = isStudent
                ? booking.mentor?.fullName || 'Mentor'
                : booking.student?.fullName || 'Student';
              const otherPartySub = isStudent
                ? `${booking.mentor?.currentRole || ''} at ${booking.mentor?.currentCompany || ''}`
                : `${booking.student?.department || ''} (Batch ${booking.student?.graduationYear || ''})`;

              return (
                <div
                  key={booking.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      <User className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{otherPartyName}</h3>
                        <Badge
                          variant={
                            booking.status === 'CONFIRMED'
                              ? 'success'
                              : booking.status === 'COMPLETED'
                              ? 'info'
                              : booking.status === 'CANCELLED'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {booking.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5">{otherPartySub}</p>

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

                        {booking.resume && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                              Resume v{booking.resume.version} attached
                            </span>
                          </>
                        )}
                      </div>

                      {booking.studentNotes && (
                        <p className="text-xs text-slate-500 mt-2 italic bg-slate-50 p-2 rounded border border-slate-100">
                          Student focus: "{booking.studentNotes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex flex-wrap items-center gap-2 md:self-center">
                    {booking.meetingUrl && booking.status === 'CONFIRMED' && (
                      <a
                        href={booking.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Google Meet
                      </a>
                    )}

                    {booking.status === 'COMPLETED' && booking.feedback && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setViewingFeedback(booking)}
                      >
                        <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-500" />
                        View Feedback
                      </Button>
                    )}

                    {booking.status === 'CONFIRMED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCancellingBookingId(booking.id);
                          setCancelReason('');
                        }}
                      >
                        <Ban className="w-3.5 h-3.5 mr-1 text-rose-500" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Cancel Booking Modal */}
      <Modal
        isOpen={!!cancellingBookingId}
        onClose={() => setCancellingBookingId(null)}
        title="Cancel Mentor Booking"
        size="md"
      >
        <form onSubmit={handleCancelBooking} className="space-y-4">
          {cancelError && <ErrorAlert message={cancelError} onDismiss={() => setCancelError(null)} />}

          <p className="text-xs text-slate-600">
            Are you sure you want to cancel this interview session? The allocated slot will be released for other students.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Cancellation Reason *
            </label>
            <textarea
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule conflict with college exams or placement test..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setCancellingBookingId(null)}>
              Keep Session
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="submit"
              disabled={isCancelling || !cancelReason.trim()}
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Feedback Modal */}
      {viewingFeedback && (
        <Modal
          isOpen={!!viewingFeedback}
          onClose={() => setViewingFeedback(null)}
          title="Mentor Evaluation Report"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">
                Session with {viewingFeedback.mentor?.fullName || 'Mentor'}
              </h4>
              <p className="text-slate-500 mt-0.5">
                Evaluated on {new Date(viewingFeedback.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Ratings Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block">Technical</span>
                <span className="text-lg font-black text-indigo-900 mt-1 block">
                  {viewingFeedback.feedback?.technicalRating || 5}/5
                </span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Communication</span>
                <span className="text-lg font-black text-emerald-900 mt-1 block">
                  {viewingFeedback.feedback?.communicationRating || 5}/5
                </span>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">Problem Solving</span>
                <span className="text-lg font-black text-purple-900 mt-1 block">
                  {viewingFeedback.feedback?.problemSolvingRating || 5}/5
                </span>
              </div>
            </div>

            {/* Comments */}
            <div>
              <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Mentor Summary Comments:
              </span>
              <p className="p-3 bg-slate-50 rounded-lg text-slate-700 border border-slate-200 leading-relaxed">
                {viewingFeedback.feedback?.summaryComments || 'No written summary provided.'}
              </p>
            </div>

            {/* Recommendation */}
            {viewingFeedback.feedback?.recommendation && (
              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Overall Recommendation:
                </span>
                <p className="p-3 bg-emerald-50 rounded-lg text-emerald-800 border border-emerald-200 font-semibold">
                  {viewingFeedback.feedback.recommendation}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setViewingFeedback(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
