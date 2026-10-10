import React from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  Briefcase,
  Users,
  UserCircle,
  FileText,
  Target,
  Bot,
  Bell,
  ShieldCheck,
  LogOut,
  ChevronRight,
  X,
  CheckCircle2,
  Award,
  Layers,
  Sparkles,
  Building2,
  UserCheck,
  Star,
  Calendar,
  GraduationCap,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine whether user is on the Recruiter Side Portal
  const isRecruiterPortal = location.pathname.startsWith('/recruiter');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Student Portal Navigation Items (Recruiter Dashboard is completely removed from student portal)
  const studentPortalItems = [
    { label: 'Portal Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Placement Feed & News', path: '/feed', icon: Newspaper },
    { label: 'Campus Drives & Jobs', path: '/opportunities', icon: Briefcase },
    { label: 'Past Recruiters', path: '/past-recruiters', icon: Building2 },
    { label: 'Student Directory', path: '/students', icon: Users },
    { label: 'Student Profile', path: '/profile', icon: UserCircle },
  ];

  const careerItems = [
    { label: 'AI Resume Analyzer', path: '/resume-analyzer', icon: FileText },
    { label: 'Company Matcher', path: '/company-matcher', icon: Target },
    { label: 'Mock Interview Prep', path: '/mock-interviews', icon: Bot },
  ];

  // Recruiter Side Portal Navigation Items
  const recruiterTalentItems = [
    { label: 'Candidate Resumes & ATS', path: '/recruiter/dashboard', icon: UserCheck },
    { label: 'Shortlisted Talent Pool', path: '/recruiter/shortlist', icon: Star },
  ];

  const recruiterDriveItems = [
    { label: 'Active Drives & Roles', path: '/opportunities', icon: Briefcase },
    { label: 'Drive Interview Calendar', path: '/recruiter/calendar', icon: Calendar },
    { label: 'Corporate Recruiters', path: '/past-recruiters', icon: Building2 },
    { label: 'Campus News & Feed', path: '/feed', icon: Newspaper },
  ];

  const isStaff = user?.role === 'PLACEMENT_MANAGER' || user?.role === 'ADMIN';

  const getDisplayName = () => {
    if (user?.studentProfile?.fullName) return user.studentProfile.fullName;
    if (user?.alumniProfile?.fullName) return user.alumniProfile.fullName;
    if (user?.mentorProfile?.fullName) return user.mentorProfile.fullName;
    if (user?.managerProfile?.fullName) return user.managerProfile.fullName;
    return user?.email?.split('@')[0] || 'Member';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-stone-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-20 px-5 flex items-center justify-between border-b border-stone-200 bg-[#FAF8F5]">
            <NavLink
              to={isRecruiterPortal ? '/recruiter/dashboard' : '/'}
              className="flex items-center gap-3 group"
              onClick={onClose}
            >
              <div className="w-10 h-10 rounded-xl bg-[#172554] border border-blue-900 flex flex-col items-center justify-center text-white shadow-xs group-hover:bg-[#1E3A8A] transition-colors">
                {isRecruiterPortal ? (
                  <Building2 className="w-5 h-5 text-amber-300" />
                ) : (
                  <>
                    <span className="text-[11px] font-black tracking-tight leading-none text-white">PU</span>
                    <span className="text-[8px] font-extrabold text-amber-300 leading-none mt-0.5">A++</span>
                  </>
                )}
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-sm text-stone-900 tracking-tight block uppercase leading-tight font-serif">
                  {isRecruiterPortal ? 'Recruiter Portal' : 'Parul University'}
                </span>
                <span className="text-[10px] font-semibold text-stone-500 tracking-wide uppercase block mt-0.5">
                  {isRecruiterPortal ? 'Talent Acquisition' : 'Training & Placement'}
                </span>
              </div>
            </NavLink>
            <button
              onClick={onClose}
              className="lg:hidden text-stone-400 hover:text-stone-700 p-1.5 rounded-lg border border-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3.5 space-y-4 overflow-y-auto max-h-[calc(100vh-190px)]">
            {isRecruiterPortal ? (
              /* ======================================================== */
              /* RECRUITER SIDE PORTAL NAVIGATION                        */
              /* ======================================================== */
              <>
                {/* Section: Candidate Talent */}
                <div>
                  <span className="px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Talent Acquisition
                  </span>
                  <div className="space-y-0.5">
                    {recruiterTalentItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                              isActive
                                ? 'bg-[#F5EFE1] text-[#172554] font-bold shadow-xs border-l-3 border-[#1E3A8A]'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
                            }`
                          }
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 shrink-0 text-[#1E3A8A]" />
                            <span>{item.label}</span>
                          </div>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>

                {/* Section: Drives & Coordination */}
                <div>
                  <span className="px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Drives & Schedules
                  </span>
                  <div className="space-y-0.5">
                    {recruiterDriveItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                              isActive
                                ? 'bg-[#F5EFE1] text-[#172554] font-bold shadow-xs border-l-3 border-[#1E3A8A]'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
                            }`
                          }
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 shrink-0 text-stone-500" />
                            <span>{item.label}</span>
                          </div>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>

                {/* Switch to Student Portal Button in Recruiter Mode */}
                <div className="pt-2 border-t border-stone-200">
                  <span className="px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Navigation Switch
                  </span>
                  <Link
                    to="/"
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 hover:bg-[#F5EFE1] hover:text-[#172554] transition-colors border border-dashed border-stone-300"
                  >
                    <GraduationCap className="w-4 h-4 text-amber-700" />
                    <span>Switch to Student Portal</span>
                  </Link>
                </div>
              </>
            ) : (
              /* ======================================================== */
              /* STUDENT SIDE PORTAL NAVIGATION (No Recruiter Dashboard)  */
              /* ======================================================== */
              <>
                {/* Section: Academic Portal */}
                <div>
                  <span className="px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Campus Portal
                  </span>
                  <div className="space-y-0.5">
                    {studentPortalItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                              isActive
                                ? 'bg-[#F5EFE1] text-[#172554] font-bold shadow-xs border-l-3 border-[#1E3A8A]'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
                            }`
                          }
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 shrink-0 text-stone-500" />
                            <span>{item.label}</span>
                          </div>
                        </NavLink>
                      );
                    })}

                    {user?.role === 'STUDENT' && (
                      <NavLink
                        to="/my-applications"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                            isActive
                              ? 'bg-[#F5EFE1] text-[#172554] font-bold shadow-xs border-l-3 border-[#1E3A8A]'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-stone-500" />
                          <span>My Applications</span>
                        </div>
                      </NavLink>
                    )}
                  </div>
                </div>

                {/* Section: Career & AI Preparation */}
                <div>
                  <span className="px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Career Assessment
                  </span>
                  <div className="space-y-0.5">
                    {careerItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                              isActive
                                ? 'bg-[#F5EFE1] text-[#172554] font-bold shadow-xs border-l-3 border-[#1E3A8A]'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
                            }`
                          }
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 shrink-0 text-stone-500" />
                            <span>{item.label}</span>
                          </div>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>

                {/* Section: Communications */}
                <div>
                  <span className="px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Communication
                  </span>
                  <div className="space-y-0.5">
                    <NavLink
                      to="/notifications"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-[#F5EFE1] text-[#172554] font-bold shadow-xs border-l-3 border-[#1E3A8A]'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Bell className="w-4 h-4 shrink-0 text-stone-500" />
                        <span>Official Notices</span>
                      </div>
                      {unreadCount > 0 ? (
                        <span className="bg-[#172554] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          {unreadCount}
                        </span>
                      ) : null}
                    </NavLink>
                  </div>
                </div>

                {/* Section: Placement Cell Staff & Admin */}
                {isStaff && (
                  <div className="pt-2 border-t border-stone-200">
                    <span className="px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block mb-1.5">
                      Officer Administration
                    </span>
                    <div className="space-y-0.5">
                      <NavLink
                        to="/manager/analytics"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                            isActive
                              ? 'bg-[#F5EFE1] text-[#172554] font-bold shadow-xs border-l-3 border-[#1E3A8A]'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <LayoutDashboard className="w-4 h-4 text-[#1E3A8A]" />
                          <span>Placement Analytics</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </NavLink>

                      <NavLink
                        to="/manager/opportunities"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                            isActive
                              ? 'bg-[#F5EFE1] text-[#172554] font-bold shadow-xs border-l-3 border-[#1E3A8A]'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <Briefcase className="w-4 h-4 text-[#1E3A8A]" />
                          <span>Manage Drive Dates</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </NavLink>

                      {user?.role === 'ADMIN' && (
                        <NavLink
                          to="/admin"
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                              isActive
                                ? 'bg-[#F5EFE1] text-[#172554] font-bold shadow-xs border-l-3 border-[#1E3A8A]'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
                            }`
                          }
                        >
                          <div className="flex items-center gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-amber-700" />
                            <span>University Admin</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                        </NavLink>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </nav>
        </div>

        {/* User Institutional ID Badge & Sign Out */}
        <div className="p-3 border-t border-stone-200 bg-[#FAF8F5]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#172554] text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-900">
                {getInitials()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 truncate leading-tight">
                  {getDisplayName()}
                </p>
                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-tight block truncate">
                  {isRecruiterPortal ? 'Corporate Recruiter' : `${user?.role?.replace('_', ' ')} • PU`}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out of Portal"
              className="text-stone-400 hover:text-red-700 p-1.5 rounded-lg hover:bg-[#FAF8F5] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
