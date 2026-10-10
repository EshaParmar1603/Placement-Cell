import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, getStatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton, CardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { studentsApi } from '../../api/students';
import { StudentProfile } from '../../types';
import {
  Search,
  Users,
  GraduationCap,
  Award,
  BookOpen,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export const StudentDirectoryPage: React.FC = () => {
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [placementStatus, setPlacementStatus] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['studentsDirectory', search, department, graduationYear, placementStatus],
    queryFn: () =>
      studentsApi.listStudents({
        search: search || undefined,
        department: department || undefined,
        graduationYear: graduationYear ? parseInt(graduationYear, 10) : undefined,
        placementStatus: placementStatus || undefined,
      }),
  });

  const students = data?.data || [];

  return (
    <div>
      <Header
        onOpenSidebar={openSidebar}
        title="Student Directory"
        subtitle="Search and connect with students and batchmates across all academic engineering departments"
      />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Search & Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, enrollment #, or skill..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Comm">Electronics & Comm</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
            </select>

            <select
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="">All Batches</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>

            <select
              value={placementStatus}
              onChange={(e) => setPlacementStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="">All Placement Statuses</option>
              <option value="NOT_PLACED">Seeking Placement</option>
              <option value="PLACED">Placed</option>
              <option value="HIGHER_STUDIES">Higher Studies</option>
            </select>

            {(search || department || graduationYear || placementStatus) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setDepartment('');
                  setGraduationYear('');
                  setPlacementStatus('');
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Students Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No Students Found"
            description="No student profiles match your search criteria. Try modifying your department or batch filters."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {students.map((st) => (
              <Card
                key={st.id}
                onClick={() => setSelectedStudent(st)}
                className="hover:border-brand-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <CardBody className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {st.fullName
                          ?.split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{st.fullName}</h4>
                        <span className="text-[11px] text-slate-400 font-medium block">
                          {st.enrollmentNumber}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(st.placementStatus)}
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-1">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {st.course} • {st.department}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Class of {st.graduationYear}</span>
                      <span className="font-bold text-slate-900">CGPA: {st.cgpa}</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  {st.skills && st.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100">
                      {st.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                          {skill}
                        </span>
                      ))}
                      {st.skills.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-medium">+{st.skills.length - 4}</span>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Student Profile Quick View Modal */}
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={selectedStudent?.fullName}
          subtitle={`${selectedStudent?.enrollmentNumber} • ${selectedStudent?.department}`}
          maxWidth="lg"
        >
          {selectedStudent && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Graduation</span>
                  <span className="text-sm font-bold text-slate-800">{selectedStudent.graduationYear}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">CGPA</span>
                  <span className="text-sm font-bold text-slate-800">{selectedStudent.cgpa}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Status</span>
                  <span className="text-xs font-bold text-brand-600">
                    {selectedStudent.placementStatus.replace('_', ' ')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Completion</span>
                  <span className="text-sm font-bold text-emerald-600">{selectedStudent.profileCompletion}%</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Technical Toolkit</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.skills?.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => setSelectedStudent(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
