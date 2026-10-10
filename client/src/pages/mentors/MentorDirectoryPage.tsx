import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Building,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Sparkles,
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { mentorsApi } from '../../api/mentors';
import { resumesApi } from '../../api/resumes';
import { MentorProfile, MentorSlot, Resume } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';

export const MentorDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Booking Modal State
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<MentorSlot | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [consentGranted, setConsentGranted] = useState(false);
  const [studentNotes, setStudentNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchMentors();
    if (user?.role === 'STUDENT') {
      fetchResumes();
    }
  }, [user]);

  const fetchMentors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await mentorsApi.listMentors({
        company: companyFilter || undefined,
      });
      if (res.success && res.data) {
        setMentors(res.data);
      }
    } catch (err: any) {
      setError('Failed to fetch mentors.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const res = await resumesApi.getMyResumes();
      if (res.success && res.data) {
        setResumes(res.data);
        if (res.data.length > 0) {
          setSelectedResumeId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    }
  };

  const handleOpenBookingModal = (mentor: MentorProfile) => {
    setSelectedMentor(mentor);
    setSelectedSlot(null);
    setConsentGranted(false);
    setStudentNotes('');
    setBookingError(null);
    setBookingSuccess(false);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setBookingError('Please select an available time slot.');
      return;
    }

    if (!consentGranted) {
      setBookingError('Explicit consent to share resume and contact details is required to complete booking.');
      return;
    }

    try {
      setIsBooking(true);
      setBookingError(null);
      const res = await mentorsApi.bookSlot({
        slotId: selectedSlot.id,
        resumeId: selectedResumeId || undefined,
        consentGranted,
        studentNotes: studentNotes.trim() || undefined,
      });

      if (res.success) {
        setBookingSuccess(true);
        // Refresh mentors list to update slot statuses
        fetchMentors();
      } else {
        setBookingError(res.message || 'Booking failed.');
      }
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Failed to book slot.');
    } finally {
      setIsBooking(false);
    }
  };

  const filteredMentors = mentors.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (m.currentRole && m.currentRole.toLowerCase().includes(search.toLowerCase())) ||
      (m.expertise && m.expertise.some((e) => e.toLowerCase().includes(search.toLowerCase())));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Mentor Sessions & 1:1 Mock Interviews
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Connect directly with verified industry alumni and corporate mentors for personalized interview coaching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'STUDENT' && (
            <Button variant="outline" size="sm" onClick={() => navigate('/mentor-sessions/my-bookings')}>
              <Calendar className="w-4 h-4 mr-1.5" />
              My Booked Sessions
            </Button>
          )}
          {user?.role === 'MENTOR' && (
            <Button variant="primary" size="sm" onClick={() => navigate('/mentor-sessions/manage-slots')}>
              <Clock className="w-4 h-4 mr-1.5" />
              Manage Availability & Feedback
            </Button>
          )}
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Filter and Search Bar */}
      <Card orientation="vertical" padding="md">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by mentor name, role, or technical expertise..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          <div className="w-full sm:w-60">
            <input
              type="text"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              onBlur={fetchMentors}
              onKeyDown={(e) => e.key === 'Enter' && fetchMentors()}
              placeholder="Filter by company..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>
        </div>
      </Card>

      {/* Mentor Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : filteredMentors.length === 0 ? (
        <Card orientation="vertical" padding="lg">
          <EmptyState
            icon={Users}
            title="No Mentors Found"
            description="Try adjusting your search terms or company filter."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => {
            const availableSlots = mentor.slots?.filter((s) => !s.isBooked) || [];

            return (
              <Card
                key={mentor.id}
                orientation="vertical"
                padding="md"
                className="flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  {/* Top: Avatar & Verification */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-base flex items-center justify-center flex-shrink-0 shadow-sm">
                        {mentor.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm leading-tight">
                            {mentor.fullName}
                          </h3>
                          {mentor.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {mentor.currentRole || 'Industry Professional'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Company & Experience */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {mentor.currentCompany || 'Alumni Network'}
                    </span>
                    <span>•</span>
                    <span>{mentor.yearsExperience} yrs exp</span>
                  </div>

                  {/* Bio */}
                  {mentor.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                      {mentor.bio}
                    </p>
                  )}

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {mentor.expertise?.slice(0, 4).map((exp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]"
                      >
                        {exp}
                      </span>
                    ))}
                    {mentor.expertise && mentor.expertise.length > 4 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                        +{mentor.expertise.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-semibold text-slate-700">
                      {availableSlots.length} slot{availableSlots.length === 1 ? '' : 's'} open
                    </span>
                  </div>

                  {user?.role === 'STUDENT' ? (
                    <Button
                      variant={availableSlots.length > 0 ? 'primary' : 'outline'}
                      size="sm"
                      disabled={availableSlots.length === 0}
                      onClick={() => handleOpenBookingModal(mentor)}
                    >
                      {availableSlots.length > 0 ? 'Book Session' : 'No Open Slots'}
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Student booking only</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      {selectedMentor && (
        <Modal
          isOpen={!!selectedMentor}
          onClose={() => setSelectedMentor(null)}
          title={`Book 1:1 Session with ${selectedMentor.fullName}`}
          size="lg"
        >
          {bookingSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Interview Session Reserved!</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                  Your mentor session with {selectedMentor.fullName} is scheduled. The meeting link and details have been sent to your notifications.
                </p>
              </div>
              <div className="pt-4 flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedMentor(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedMentor(null);
                    navigate('/mentor-sessions/my-bookings');
                  }}
                >
                  View My Sessions
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              {bookingError && <ErrorAlert message={bookingError} onDismiss={() => setBookingError(null)} />}

              {/* Mentor Summary Header */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedMentor.fullName}</h4>
                  <p className="text-xs text-slate-500">
                    {selectedMentor.currentRole} at {selectedMentor.currentCompany}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    1:1 Mock Interview
                  </span>
                </div>
              </div>

              {/* Select Slot */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  1. Select Available Time Slot *
                </label>
                {selectedMentor.slots && selectedMentor.slots.filter((s) => !s.isBooked).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {selectedMentor.slots
                      .filter((s) => !s.isBooked)
                      .map((slot) => {
                        const isChosen = selectedSlot?.id === slot.id;
                        return (
                          <button
                            type="button"
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-lg border text-left text-xs transition-all ${
                              isChosen
                                ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900'
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            <div className="font-semibold">
                              {new Date(slot.slotDate).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="text-slate-500 mt-0.5">
                              {slot.startTime} – {slot.endTime}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-xs text-rose-600 italic">No slots currently available for this mentor.</p>
                )}
              </div>

              {/* Select Resume */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Select Resume to Share with Mentor
                </label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                >
                  <option value="">No resume (General discussion)</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      v{r.version} — {r.originalName} ({new Date(r.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Preparation Notes or Specific Target Role (Optional)
                </label>
                <textarea
                  rows={2}
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="e.g. Focus on System Design, Data Structures, or behavioral questions for upcoming drive."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGranted}
                    onChange={(e) => setConsentGranted(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <div className="text-xs text-indigo-950">
                    <span className="font-semibold block">Mandatory Student Consent:</span>
                    I grant explicit consent to share my student profile details and selected resume version with this mentor for the sole purpose of interview preparation and post-session evaluation.
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button variant="outline" size="sm" type="button" onClick={() => setSelectedMentor(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isBooking || !selectedSlot || !consentGranted}
                >
                  {isBooking ? 'Confirming...' : 'Confirm Booking'}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
