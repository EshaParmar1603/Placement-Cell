import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  CheckCheck,
  Clock,
  Briefcase,
  Calendar,
  Sparkles,
  Info,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const filteredNotifications = filterUnreadOnly
    ? notifications.filter((n: NotificationItem) => !n.isRead)
    : notifications;

  const handleNotificationClick = (n: NotificationItem) => {
    if (!n.isRead) {
      markAsRead(n.id);
    }

    // Smart routing based on notification type or data payload
    if (n.data?.opportunityId) {
      navigate('/opportunities');
    } else if (n.data?.sessionId) {
      navigate(`/mock-interviews/${n.data.sessionId}`);
    } else if (n.data?.bookingId) {
      navigate('/mentor-sessions/my-bookings');
    } else if (n.type?.includes('APPLICATION')) {
      navigate('/my-applications');
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('OPPORTUNITY')) {
      return <Briefcase className="w-5 h-5 text-indigo-600" />;
    }
    if (type.includes('BOOKING') || type.includes('MENTOR')) {
      return <Calendar className="w-5 h-5 text-emerald-600" />;
    }
    if (type.includes('MOCK_INTERVIEW')) {
      return <Sparkles className="w-5 h-5 text-purple-600" />;
    }
    return <Bell className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600" />
            Notifications & Announcements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay informed with real-time drive alerts, recruitment status transitions, and interview schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
              <CheckCheck className="w-4 h-4 mr-1.5" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <Card padding="sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterUnreadOnly(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !filterUnreadOnly
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setFilterUnreadOnly(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterUnreadOnly
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    filterUnreadOnly ? 'bg-indigo-800 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <Card padding="lg">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-16 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-16 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-16 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filterUnreadOnly ? 'No Unread Notifications' : 'Notification Box is Empty'}
            description={
              filterUnreadOnly
                ? 'You are all caught up! Switch to All Notifications to review past events.'
                : 'Whenever new drives are posted, applications progress, or mentor calls are booked, alerts will appear here.'
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((n: NotificationItem) => {
              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                    !n.isRead
                      ? 'border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/60 shadow-sm'
                      : 'border-slate-100 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-sm tracking-tight truncate ${
                          !n.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                        }`}
                      >
                        {n.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(n.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {!n.isRead && (
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="mt-2.5 flex items-center gap-3">
                      <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                        View Details <ArrowRight className="w-3 h-3" />
                      </span>

                      {!n.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                          }}
                          className="text-[11px] text-slate-400 hover:text-slate-600"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
