import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isRecruiterPortal = location.pathname.startsWith('/recruiter');

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      {/* Top University Institutional Ribbon */}
      <div className="bg-[#172554] text-white text-[11px] font-medium py-1.5 px-4 sm:px-6 flex items-center justify-between border-b border-[#0F172A] z-40">
        <div className="flex items-center gap-2.5">
          <span className="font-extrabold text-amber-300 tracking-wider">PARUL UNIVERSITY</span>
          <span className="text-blue-400">|</span>
          <span className="hidden sm:inline text-blue-100 text-[11px]">
            {isRecruiterPortal ? 'CORPORATE RECRUITER & TALENT PORTAL' : 'TRAINING & PLACEMENT DIRECTORATE'}
          </span>
          <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-400/30">
            NAAC GRADE A++
          </span>
        </div>
        <div className="flex items-center gap-3 text-blue-200 text-[10px] tracking-wide">
          {isRecruiterPortal ? (
            <Link
              to="/"
              className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 px-2.5 py-0.5 rounded font-bold border border-amber-400/40 transition-colors flex items-center gap-1.5"
            >
              <span>🎓 Switch to Student Portal</span>
            </Link>
          ) : (
            <Link
              to="/recruiter/dashboard"
              className="bg-blue-900 hover:bg-blue-800 text-blue-100 px-2.5 py-0.5 rounded font-bold border border-blue-700 transition-colors flex items-center gap-1.5"
            >
              <span>🏢 Recruiter Side Portal</span>
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <main className="flex-1 pb-16 bg-[#FAF8F5]">
            <Outlet context={{ openSidebar: () => setIsSidebarOpen(true) }} />
          </main>
        </div>
      </div>
    </div>
  );
};
