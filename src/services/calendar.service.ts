import { prisma } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { OpportunityStatus, NotificationType } from '@prisma/client';
import { notificationService } from './notification.service.js';

export interface CalendarEvent {
  id: string;
  title: string;
  eventType: 'DRIVE_DEADLINE' | 'PRE_PLACEMENT_TALK' | 'ONLINE_ASSESSMENT' | 'TECHNICAL_INTERVIEW' | 'HR_INTERVIEW' | 'RESULT_ANNOUNCEMENT' | 'CAMPUS_VISIT';
  date: string; // ISO date string YYYY-MM-DD
  time?: string; // e.g. "10:00 AM"
  companyName?: string;
  opportunityId?: string;
  locationOrLink?: string;
  description?: string;
  scheduledBy?: string;
  isManagerEvent: boolean;
  createdAt: string;
}

const CALENDAR_CONFIG_KEY = 'PLACEMENT_CALENDAR_EVENTS';

export class CalendarService {
  async getAllEvents(): Promise<CalendarEvent[]> {
    // 1. Fetch custom manager-scheduled events from SystemConfig
    const configRecord = await prisma.systemConfig.findUnique({
      where: { key: CALENDAR_CONFIG_KEY },
    });

    let managerEvents: CalendarEvent[] = [];
    if (configRecord && Array.isArray(configRecord.value)) {
      managerEvents = configRecord.value as CalendarEvent[];
    }

    // 2. Fetch published opportunities deadlines from database
    const opportunities = await prisma.opportunity.findMany({
      where: { status: OpportunityStatus.PUBLISHED },
      include: { company: true },
      orderBy: { deadline: 'asc' },
    });

    const oppEvents: CalendarEvent[] = opportunities.map((opp) => ({
      id: `opp-deadline-${opp.id}`,
      title: `${opp.company.name} — Application Deadline`,
      eventType: 'DRIVE_DEADLINE',
      date: opp.deadline.toISOString().split('T')[0],
      time: opp.deadline.toISOString().split('T')[1]?.slice(0, 5) || '23:59',
      companyName: opp.company.name,
      opportunityId: opp.id,
      locationOrLink: opp.location,
      description: `Final deadline to submit application for ${opp.title} (${opp.employmentType}). Min CGPA: ${opp.minCgpa}.`,
      isManagerEvent: false,
      createdAt: opp.createdAt.toISOString(),
    }));

    // Merge and sort chronologically by date
    const all = [...managerEvents, ...oppEvents].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });

    return all;
  }

  async scheduleEvent(data: {
    title: string;
    eventType: CalendarEvent['eventType'];
    date: string;
    time?: string;
    companyName?: string;
    locationOrLink?: string;
    description?: string;
    opportunityId?: string;
  }, managerUserId: string): Promise<CalendarEvent> {
    const newEvent: CalendarEvent = {
      id: uuidv4(),
      title: data.title,
      eventType: data.eventType || 'PRE_PLACEMENT_TALK',
      date: data.date,
      time: data.time || '10:00 AM',
      companyName: data.companyName,
      locationOrLink: data.locationOrLink,
      description: data.description,
      opportunityId: data.opportunityId,
      scheduledBy: managerUserId,
      isManagerEvent: true,
      createdAt: new Date().toISOString(),
    };

    const configRecord = await prisma.systemConfig.findUnique({
      where: { key: CALENDAR_CONFIG_KEY },
    });

    const currentList: CalendarEvent[] = configRecord && Array.isArray(configRecord.value)
      ? (configRecord.value as CalendarEvent[])
      : [];

    currentList.push(newEvent);

    await prisma.systemConfig.upsert({
      where: { key: CALENDAR_CONFIG_KEY },
      update: { value: currentList as any },
      create: {
        key: CALENDAR_CONFIG_KEY,
        value: currentList as any,
        description: 'Placement Cell Scheduled Calendar Events',
      },
    });

    // Notify registered students about this newly scheduled placement event
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true },
    });

    for (const student of students) {
      await notificationService.create({
        userId: student.id,
        type: NotificationType.ANNOUNCEMENT,
        title: `Scheduled: ${newEvent.title}`,
        message: `${newEvent.eventType.replace(/_/g, ' ')} scheduled for ${newEvent.date} at ${newEvent.time}. Location: ${newEvent.locationOrLink || 'Placement Cell / Campus'}.`,
        data: { eventId: newEvent.id, date: newEvent.date },
      }).catch(() => {});
    }

    return newEvent;
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    const configRecord = await prisma.systemConfig.findUnique({
      where: { key: CALENDAR_CONFIG_KEY },
    });

    if (!configRecord || !Array.isArray(configRecord.value)) return false;

    const currentList = configRecord.value as CalendarEvent[];
    const filtered = currentList.filter((e) => e.id !== eventId);

    await prisma.systemConfig.update({
      where: { key: CALENDAR_CONFIG_KEY },
      data: { value: filtered as any },
    });

    return true;
  }
}

export const calendarService = new CalendarService();
