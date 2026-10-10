import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Feature Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { FeedPage } from './pages/feed/FeedPage';
import { OpportunitiesPage } from './pages/opportunities/OpportunitiesPage';
import { MyApplicationsPage } from './pages/opportunities/MyApplicationsPage';
import { StudentDirectoryPage } from './pages/directory/StudentDirectoryPage';
import { PastRecruitersPage } from './pages/directory/PastRecruitersPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ResumeAnalyzerPage } from './pages/resume/ResumeAnalyzerPage';
import { CompanyMatcherPage } from './pages/matcher/CompanyMatcherPage';
import { MockInterviewPage } from './pages/mockInterview/MockInterviewPage';
import { MockInterviewRoomPage } from './pages/mockInterview/MockInterviewRoomPage';
import { RecruiterDashboardPage } from './pages/recruiter/RecruiterDashboardPage';
import { RecruiterCalendarPage } from './pages/recruiter/RecruiterCalendarPage';
import { RecruiterShortlistPage } from './pages/recruiter/RecruiterShortlistPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { ManagerAnalyticsPage } from './pages/manager/ManagerAnalyticsPage';
import { ManagerOpportunitiesPage } from './pages/manager/ManagerOpportunitiesPage';
import { AdminConsolePage } from './pages/admin/AdminConsolePage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Authenticated Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Core Student / Common Routes */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        <Route path="/my-applications" element={<MyApplicationsPage />} />
        <Route path="/students" element={<StudentDirectoryPage />} />
        <Route path="/past-recruiters" element={<PastRecruitersPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Corporate Recruiter Portal */}
        <Route path="/recruiter" element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="/recruiter/dashboard" element={<RecruiterDashboardPage />} />
        <Route path="/recruiter/calendar" element={<RecruiterCalendarPage />} />
        <Route path="/recruiter/shortlist" element={<RecruiterShortlistPage />} />

        {/* AI & Preparation Hub */}
        <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
        <Route path="/company-matcher" element={<CompanyMatcherPage />} />
        <Route path="/mock-interviews" element={<MockInterviewPage />} />
        <Route path="/mock-interviews/:id" element={<MockInterviewRoomPage />} />

        {/* Legacy Mentor Routes Redirect to Recruiter Dashboard */}
        <Route path="/mentors" element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="/mentor-sessions" element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="/mentor-sessions/*" element={<Navigate to="/recruiter/dashboard" replace />} />

        {/* Notifications */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Placement Manager Specific Routes */}
        <Route
          path="/manager/analytics"
          element={
            <ProtectedRoute allowedRoles={['PLACEMENT_MANAGER', 'ADMIN']}>
              <ManagerAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/opportunities"
          element={
            <ProtectedRoute allowedRoles={['PLACEMENT_MANAGER', 'ADMIN']}>
              <ManagerOpportunitiesPage />
            </ProtectedRoute>
          }
        />

        {/* Administrator Console */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminConsolePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
