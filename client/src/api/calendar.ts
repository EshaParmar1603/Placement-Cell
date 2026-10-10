import { apiClient } from './client';
import { ApiResponse, CalendarEvent } from '../types';

const STORAGE_KEY = 'placewise_calendar_events';

function normalizeDate(d: string): string {
  if (!d) return new Date().toISOString().split('T')[0];
  const trimmed = d.trim();
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    // If DD-MM-YYYY
    if (parts[0].length === 2 && parts[2]?.length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return trimmed;
}

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Google Pre-Placement Talk & Technical Assessment',
    eventType: 'PRE_PLACEMENT_TALK',
    date: '2026-10-14',
    time: '11:00 AM',
    companyName: 'Google',
    locationOrLink: 'Main University Auditorium & YouTube Live',
    description: 'Overview of Google SWE roles, hiring rubric, and distributed systems questions.',
    isManagerEvent: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-2',
    title: 'Amazon Online Coding Assessment',
    eventType: 'ONLINE_ASSESSMENT',
    date: '2026-10-18',
    time: '02:00 PM',
    companyName: 'Amazon',
    locationOrLink: 'HackerRank Secure Portal',
    description: '2 Coding questions (Data structures & Algorithms) + Work styles assessment.',
    isManagerEvent: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-3',
    title: 'TCS Digital Technical Interview Rounds',
    eventType: 'TECHNICAL_INTERVIEW',
    date: '2026-10-22',
    time: '10:00 AM',
    companyName: 'TCS',
    locationOrLink: 'Placement Block Room 204',
    description: 'Technical rounds on Java, SQL, and full-stack project architecture.',
    isManagerEvent: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-4',
    title: 'Microsoft SWE Application Deadline',
    eventType: 'DRIVE_DEADLINE',
    date: '2026-10-25',
    time: '11:59 PM',
    companyName: 'Microsoft',
    locationOrLink: 'PlaceWise Portal',
    description: 'Final date to submit verified ATS resume for Microsoft India campus drive.',
    isManagerEvent: true,
    createdAt: new Date().toISOString(),
  },
];

function getStoredEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_EVENTS;
}

function saveStoredEvents(events: CalendarEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // ignore
  }
}

export const calendarApi = {
  async getEvents(): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      const res = await apiClient.get<ApiResponse<CalendarEvent[]>>('/calendar/events');
      if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback to local persistence
    }

    return {
      success: true,
      data: getStoredEvents(),
    };
  },

  async scheduleEvent(data: {
    title: string;
    eventType: CalendarEvent['eventType'];
    date: string;
    time?: string;
    companyName?: string;
    locationOrLink?: string;
    description?: string;
    opportunityId?: string;
  }): Promise<ApiResponse<CalendarEvent>> {
    const cleanDate = normalizeDate(data.date);

    try {
      const res = await apiClient.post<ApiResponse<CalendarEvent>>('/calendar/events', {
        ...data,
        date: cleanDate,
      });
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback to local storage
    }

    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: data.title,
      eventType: data.eventType,
      date: cleanDate,
      time: data.time || '10:00 AM',
      companyName: data.companyName,
      locationOrLink: data.locationOrLink || 'Campus Placement Cell Hall',
      description: data.description,
      opportunityId: data.opportunityId,
      isManagerEvent: true,
      createdAt: new Date().toISOString(),
    };

    const current = getStoredEvents();
    const updated = [newEvent, ...current];
    saveStoredEvents(updated);

    return {
      success: true,
      message: 'Event scheduled successfully',
      data: newEvent,
    };
  },

  async deleteEvent(id: string): Promise<ApiResponse<null>> {
    try {
      const res = await apiClient.delete<ApiResponse>(`/calendar/events/${id}`);
      if (res.data && res.data.success) {
        return {
          success: true,
          message: 'Event removed',
          data: null,
        };
      }
    } catch {
      // Fallback to local storage
    }

    const current = getStoredEvents();
    const updated = current.filter((e) => e.id !== id);
    saveStoredEvents(updated);

    return {
      success: true,
      message: 'Event removed',
      data: null,
    };
  },
};
