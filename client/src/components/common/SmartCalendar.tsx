import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  MapPin,
  Building,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { calendarApi } from '../../api/calendar';
import { CalendarEvent } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { ErrorAlert } from '../ui/ErrorAlert';

interface SmartCalendarProps {
  canSchedule?: boolean; // True for Placement Manager & Admin
  className?: string;
}

const EVENT_TYPE_LABELS: Record<CalendarEvent['eventType'], string> = {
  DRIVE_DEADLINE: 'Drive Deadline',
  PRE_PLACEMENT_TALK: 'Pre-Placement Talk',
  ONLINE_ASSESSMENT: 'Online Assessment',
  TECHNICAL_INTERVIEW: 'Technical Interview',
  HR_INTERVIEW: 'HR Interview',
  RESULT_ANNOUNCEMENT: 'Result Announcement',
  CAMPUS_VISIT: 'Campus Drive Day',
};

const EVENT_TYPE_COLORS: Record<CalendarEvent['eventType'], string> = {
  DRIVE_DEADLINE: 'bg-rose-50 text-rose-800 border-rose-200',
  PRE_PLACEMENT_TALK: 'bg-[#F5EFE1] text-[#172554] border-[#EADFC9] font-semibold',
  ONLINE_ASSESSMENT: 'bg-amber-50 text-amber-800 border-amber-200',
  TECHNICAL_INTERVIEW: 'bg-blue-50 text-blue-900 border-blue-200',
  HR_INTERVIEW: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  RESULT_ANNOUNCEMENT: 'bg-stone-100 text-stone-900 border-stone-300 font-bold',
  CAMPUS_VISIT: 'bg-[#FAF8F5] text-[#172554] border-stone-300 font-bold',
};

export const SmartCalendar: React.FC<SmartCalendarProps> = ({ canSchedule = false, className = '' }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar View Date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Schedule Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<CalendarEvent['eventType']>('PRE_PLACEMENT_TALK');
  const [scheduleDate, setScheduleDate] = useState(selectedDateStr);
  const [scheduleTime, setScheduleTime] = useState('10:00 AM');
  const [companyName, setCompanyName] = useState('');
  const [locationOrLink, setLocationOrLink] = useState('Campus Placement Cell Hall');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await calendarApi.getEvents();
      if (res.success && res.data) {
        setEvents(res.data);
      }
    } catch (err: any) {
      setError('Unable to load placement calendar events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const setToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleOpenScheduleModal = (dateStr?: string) => {
    setScheduleDate(dateStr || selectedDateStr);
    setTitle('');
    setCompanyName('');
    setDescription('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduleDate) {
      setModalError('Please fill in title and date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);
      const res = await calendarApi.scheduleEvent({
        title: title.trim(),
        eventType,
        date: scheduleDate,
        time: scheduleTime,
        companyName: companyName.trim() || undefined,
        locationOrLink: locationOrLink.trim() || undefined,
        description: description.trim() || undefined,
      });

      if (res.success) {
        setIsModalOpen(false);
        await fetchEvents();
        setSelectedDateStr(scheduleDate);
      } else {
        setModalError(res.message || 'Failed to schedule event.');
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Error scheduling date.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this scheduled event?')) return;
    try {
      await calendarApi.deleteEvent(id);
      fetchEvents();
    } catch (err) {
      console.error('Delete event failed', err);
    }
  };

  // Group events by YYYY-MM-DD
  const eventsByDate = events.reduce((acc, ev) => {
    acc[ev.date] = acc[ev.date] || [];
    acc[ev.date].push(ev);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const selectedDateEvents = eventsByDate[selectedDateStr] || [];
  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date()).slice(0, 5);

  return (
    <Card padding="md" className={`bg-white border border-slate-200 shadow-sm ${className}`}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">
              Placement Smart Calendar
            </h3>
            <p className="text-xs text-slate-500">
              {canSchedule
                ? 'Manage and schedule corporate drive dates, assessments, and interview rounds'
                : 'Live corporate drive deadlines, pre-placement talks, and selection dates'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canSchedule && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenScheduleModal()}
              className="bg-[#172554] hover:bg-[#1E3A8A] text-white shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Schedule Date
            </Button>
          )}

          <div className="flex items-center bg-[#FAF8F5] border border-stone-200 rounded-lg p-0.5">
            <button
              onClick={prevMonth}
              className="p-1 rounded text-stone-500 hover:text-stone-800 hover:bg-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 text-stone-800">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded text-stone-500 hover:text-stone-800 hover:bg-white transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={setToday} className="text-xs px-2.5 py-1">
            Today
          </Button>
        </div>
      </div>

      {error && <ErrorAlert message={error} className="my-3" />}

      {/* Main Grid: Calendar Month Matrix + Event Schedule Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        {/* Left: 7-Column Month Grid */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <span key={i} className="text-[11px] font-bold text-stone-400 uppercase py-1">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Empty offset padding cells */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12 sm:h-14 rounded-lg bg-stone-50/60" />
            ))}

            {/* Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = eventsByDate[dateStr] || [];
              const isSelected = selectedDateStr === dateStr;
              const isToday =
                new Date().toISOString().split('T')[0] === dateStr;

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-12 sm:h-14 p-1 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-[#1E3A8A] bg-[#F5EFE1] shadow-xs font-bold'
                      : isToday
                      ? 'border-[#1E3A8A] bg-white font-semibold'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isToday
                          ? 'bg-[#172554] text-white font-bold'
                          : isSelected
                          ? 'text-[#172554] font-bold'
                          : 'text-stone-700 font-medium'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#1E3A8A]" />
                    )}
                  </div>

                  {/* Event Mini Indicators */}
                  <div className="w-full flex items-center gap-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev, idx) => (
                      <div
                        key={idx}
                        className="text-[9px] truncate px-1 py-0.2 rounded bg-[#FAF8F5] text-[#172554] border border-stone-200 font-semibold max-w-full"
                        title={ev.title}
                      >
                        {ev.companyName || ev.eventType.replace('_', ' ')}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-stone-400 font-bold">
                        +{dayEvents.length - 2}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Events Details */}
        <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Selected Date
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h4>
              </div>

              {canSchedule && (
                <button
                  onClick={() => handleOpenScheduleModal(selectedDateStr)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Event
                </button>
              )}
            </div>

            {/* List of events on selected date */}
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {selectedDateEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          EVENT_TYPE_COLORS[ev.eventType] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {EVENT_TYPE_LABELS[ev.eventType] || ev.eventType}
                      </span>

                      {canSchedule && ev.isManagerEvent && (
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete scheduled date"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-900 leading-snug">
                        {ev.title}
                      </h5>
                      {ev.companyName && (
                        <p className="text-[11px] font-semibold text-indigo-700 mt-0.5 flex items-center gap-1">
                          <Building className="w-3 h-3 text-indigo-500" />
                          {ev.companyName}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                      {ev.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {ev.time}
                        </span>
                      )}
                      {ev.locationOrLink && (
                        <span className="flex items-center gap-1 truncate max-w-[180px]">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {ev.locationOrLink}
                        </span>
                      )}
                    </div>

                    {ev.description && (
                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100 leading-relaxed">
                        {ev.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <Clock className="w-7 h-7 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-medium">No events scheduled on this date.</p>
                <p className="text-[11px] text-slate-400">
                  Select another date or view upcoming placement milestones below.
                </p>
              </div>
            )}
          </div>

          {/* Quick upcoming schedule summary */}
          {selectedDateEvents.length === 0 && upcomingEvents.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Upcoming Placement Milestones
              </span>
              <div className="space-y-1.5">
                {upcomingEvents.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedDateStr(item.date)}
                    className="w-full text-left p-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-bold">
                      {new Date(item.date + 'T00:00:00').toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Event Modal for Placement Manager */}
      {canSchedule && isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Schedule Placement Drive Event"
          size="md"
        >
          <form onSubmit={handleScheduleSubmit} className="space-y-3.5">
            {modalError && <ErrorAlert message={modalError} onDismiss={() => setModalError(null)} />}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Google Pre-Placement Talk & Q&A Session"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Event Category *
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as CalendarEvent['eventType'])}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                >
                  <option value="PRE_PLACEMENT_TALK">Pre-Placement Talk (PPT)</option>
                  <option value="ONLINE_ASSESSMENT">Online Assessment / Test</option>
                  <option value="TECHNICAL_INTERVIEW">Technical Interview Round</option>
                  <option value="HR_INTERVIEW">HR Interview Round</option>
                  <option value="RESULT_ANNOUNCEMENT">Final Result Announcement</option>
                  <option value="CAMPUS_VISIT">Campus Drive Day</option>
                  <option value="DRIVE_DEADLINE">Application Deadline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google, Amazon, Microsoft"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
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
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  placeholder="e.g. 10:00 AM or 02:30 PM"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Venue or Online Meeting Link
              </label>
              <input
                type="text"
                value={locationOrLink}
                onChange={(e) => setLocationOrLink(e.target.value)}
                placeholder="e.g. Auditorium Hall 1 / Google Meet Link"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Instructions / Description for Students
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention mandatory documents to carry, dress code, or online test link instructions..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Card>
  );
};
