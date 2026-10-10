import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { SmartCalendar } from '../../components/common/SmartCalendar';
import { Button } from '../../components/ui/Button';
import {
  Calendar,
  Building2,
  UserCheck,
  Briefcase,
  ArrowLeft,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const RecruiterCalendarPage: React.FC = () => {
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <Header
        onOpenSidebar={openSidebar}
        title="Corporate Recruitment Calendar & Drive Schedules"
        subtitle="View and coordinate scheduled corporate campus placement drives, technical evaluation windows, and interview slots with the Parul University Placement Directorate."
        actions={
          <Link to="/recruiter/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-stone-300 text-stone-800 hover:bg-[#FAF8F5] flex items-center gap-1.5 text-xs font-semibold"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Candidate Resumes
            </Button>
          </Link>
        }
      />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Recruiter Drive Schedule Header Banner */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#172554] text-white flex items-center justify-center border border-blue-900 shadow-xs shrink-0">
              <Calendar className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#F5EFE1] text-[#172554] border border-[#E7E5E4]">
                  Session 2025–26
                </span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Hiring Season
                </span>
              </div>
              <h2 className="text-lg font-bold text-stone-900 mt-0.5 font-serif">
                Campus Drive & Assessment Schedule
              </h2>
              <p className="text-xs text-stone-500">
                Click any scheduled date to inspect drive milestones, application deadlines, and PPT timings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/opportunities">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-xs font-semibold"
              >
                <Briefcase className="w-3.5 h-3.5 mr-1" />
                View All Active Drives
              </Button>
            </Link>
          </div>
        </div>

        {/* Smart Calendar Component */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-xs">
          <SmartCalendar />
        </div>
      </div>
    </div>
  );
};
