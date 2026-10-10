import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle2,
  Calendar,
  Sparkles,
  PieChart as PieChartIcon,
  Layers,
  ArrowUpRight,
  Filter,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { analyticsApi } from '../../api/analytics';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/common/StatCard';
import { SmartCalendar } from '../../components/common/SmartCalendar';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorAlert } from '../../components/ui/ErrorAlert';

const PIE_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const ManagerAnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [demographics, setDemographics] = useState<any>(null);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [ovRes, demoRes, funRes] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getDemographics(),
          analyticsApi.getFunnel(),
        ]);

        if (ovRes.success && ovRes.data) setOverview(ovRes.data);
        if (demoRes.success && demoRes.data) setDemographics(demoRes.data);
        if (funRes.success && funRes.data) setFunnel(funRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load placement analytics.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  const departmentData = demographics?.byDepartment || [];
  const placementData = demographics?.byPlacementStatus?.map((p: any) => ({
    name: p.status.replace('_', ' '),
    value: p.count,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          Placement Cell Analytics & Reporting
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time institutional metrics, scheduled corporate drive milestones, and student recruitment funnels.
        </p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Top Stats Cards (Clear & Focused) */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Students"
            value={overview.students?.totalRegistered || 0}
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            subtext={`${overview.students?.placedCount || 0} placed (${overview.students?.placementRatePercentage || 0}%)`}
          />

          <StatCard
            label="Published Drives"
            value={overview.opportunities?.published || 0}
            icon={Briefcase}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
            subtext={`${overview.opportunities?.closed || 0} closed drives`}
          />

          <StatCard
            label="Applications Submitted"
            value={overview.applications?.totalSubmitted || 0}
            icon={Layers}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            subtext={`${overview.applications?.uniqueStudentsApplied || 0} unique student applicants`}
          />

          <StatCard
            label="Placement Rate"
            value={`${overview.students?.placementRatePercentage || 0}%`}
            icon={Award}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
            subtext={`${overview.students?.placedCount || 0} students placed`}
          />
        </div>
      )}

      {/* SMART CALENDAR FOR PLACEMENT MANAGER (Scheduling Mode Active) */}
      <div>
        <SmartCalendar canSchedule={true} />
      </div>

      {/* Secondary Metrics Bar */}
      {overview?.preparationActivity && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card padding="md" className="bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  NVIDIA AI Resumes Processed & Scored
                </span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {overview.preparationActivity.resumesAnalyzed}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-indigo-600 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card padding="md" className="bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Mock Interview Simulations Completed
                </span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {overview.preparationActivity.mockInterviewsCompleted}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-purple-600 shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Distribution (BarChart) */}
        <div className="lg:col-span-7">
          <Card padding="lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Student Enrollment by Department
              </h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="department"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Placement Status Distribution (PieChart) */}
        <div className="lg:col-span-5">
          <Card padding="lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Placement Status Distribution
              </h3>
            </div>
            <div className="h-64 w-full">
              {placementData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={placementData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {placementData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs italic">
                  No placement records available yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Recruitment Funnel Stages */}
      <Card padding="lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Application Funnel by Recruitment Stage</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cumulative progression of all student job applications across institution drives.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {funnel.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col justify-between"
            >
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {item.stage.replace('_', ' ')}
              </span>
              <span className="text-xl font-extrabold text-slate-900 my-1 block">
                {item.count}
              </span>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full"
                  style={{
                    width: `${Math.min((item.count / (funnel[0]?.count || 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
