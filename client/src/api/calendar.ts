import { apiClient } from './client';
import { ApiResponse, CalendarEvent } from '../types';

export const calendarApi = {
  async getEvents() {
    const res = await apiClient.get<ApiResponse<CalendarEvent[]>>('/calendar/events');
    return res.data;
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
  }) {
    const res = await apiClient.post<ApiResponse<CalendarEvent>>('/calendar/events', data);
    return res.data;
  },

  async deleteEvent(id: string) {
    const res = await apiClient.delete<ApiResponse>(`/calendar/events/${id}`);
    return res.data;
  },
};
