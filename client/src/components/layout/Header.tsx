import React from 'react';
import { Menu, Bell, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenSidebar: () => void;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar, title, subtitle, actions }) => {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  return (
    <header className="h-16 px-4 sm:px-8 border-b border-stone-200 bg-white/95 sticky top-0 z-30 flex items-center justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          {title && <h1 className="text-base sm:text-lg font-bold text-stone-900 leading-tight tracking-tight">{title}</h1>}
          {subtitle && <p className="text-xs text-stone-500 hidden sm:block font-medium">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}

        {/* AI Quick Pill */}
        <Link
          to="/mock-interviews"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-700" />
          <span>AI Interview Coach</span>
        </Link>

        {/* Notification Bell */}
        <Link
          to="/notifications"
          className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5] border border-stone-200 rounded-lg transition-colors"
          title="Notifications & Circulars"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-600 rounded-full" />
          )}
        </Link>
      </div>
    </header>
  );
};
