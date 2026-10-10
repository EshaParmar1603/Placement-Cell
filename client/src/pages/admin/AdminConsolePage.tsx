import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  ShieldCheck,
  FileText,
  Settings,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Eye,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { User, UserRole, AccountStatus } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';

const ALL_ROLES: UserRole[] = ['STUDENT', 'ALUMNI', 'MENTOR', 'PLACEMENT_MANAGER', 'ADMIN'];

export const AdminConsolePage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'verifications' | 'audit' | 'config'>('users');

  // Users tab state
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchUser, setSearchUser] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Role Edit Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // System Config state
  const [configKey, setConfigKey] = useState('PLACEMENT_CELL_CONFIG');
  const [configValue, setConfigValue] = useState(
    JSON.stringify(
      {
        institutionName: 'PlaceWise Institute of Technology',
        allowDirectStudentApplications: true,
        defaultMinCgpa: 6.5,
        maxBacklogsAllowed: 1,
        autoShortlistAboveCgpa: 8.5,
      },
      null,
      2
    )
  );
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      setError(null);
      const res = await adminApi.listUsers({
        role: (roleFilter as UserRole) || undefined,
      });
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setIsLoadingAudit(true);
      const res = await adminApi.getAuditLogs();
      if (res.success && res.data) {
        setAuditLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'verifications') {
      fetchUsers();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab, roleFilter]);

  const handleToggleStatus = async (userToUpdate: User) => {
    const newStatus: AccountStatus = userToUpdate.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await adminApi.updateUserStatus(userToUpdate.id, newStatus);
      if (res.success) {
        fetchUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setIsUpdatingRole(true);
      const res = await adminApi.updateUserRole(editingUser.id, selectedRole);
      if (res.success) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleVerifyProfile = async (type: 'alumni' | 'mentor', profileId: string, isVerified: boolean) => {
    try {
      const res = await adminApi.verifyProfile(type, profileId, isVerified);
      if (res.success) {
        fetchUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to update ${type} verification.`);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingConfig(true);
      setConfigSuccess(false);
      const parsed = JSON.parse(configValue);
      const res = await adminApi.updateSystemConfig(configKey, parsed, 'Platform default policies');
      if (res.success) {
        setConfigSuccess(true);
      }
    } catch (err: any) {
      setError('Invalid JSON configuration syntax.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const name =
      u.studentProfile?.fullName ||
      u.alumniProfile?.fullName ||
      u.mentorProfile?.fullName ||
      u.managerProfile?.fullName ||
      '';
    return (
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      name.toLowerCase().includes(searchUser.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-indigo-600" />
          Administrative Control Console
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Root authority for role assignments, user status locks, alumni/mentor credential verification, and security audit logs.
        </p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Tabs */}
      <Card orientation="vertical" padding="sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            User & Role Management
          </button>

          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'verifications'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Alumni & Mentor Verification
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            Security Audit Trail
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'config'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            System Configuration
          </button>
        </div>
      </Card>

      {/* TAB 1: User & Role Management */}
      {activeTab === 'users' && (
        <Card orientation="vertical" padding="lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                <option value="">All Roles</option>
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ')}
                  </option>
                ))}
              </select>

              <Button variant="outline" size="sm" onClick={fetchUsers}>
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {isLoadingUsers ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Users Found"
              description="No users matched your search criteria."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-2.5 px-3 font-semibold text-slate-700">User / Profile</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Email Address</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Role</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Joined</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const profileName =
                      u.studentProfile?.fullName ||
                      u.alumniProfile?.fullName ||
                      u.mentorProfile?.fullName ||
                      u.managerProfile?.fullName ||
                      'Unregistered Profile';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{profileName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{u.id.slice(0, 8)}...</span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">{u.email}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant="primary" size="sm">
                            {u.role.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant={u.status === 'ACTIVE' ? 'success' : 'danger'}
                            size="sm"
                          >
                            {u.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingUser(u);
                                setSelectedRole(u.role);
                              }}
                            >
                              Role
                            </Button>

                            {u.id !== currentUser?.id && (
                              <Button
                                variant={u.status === 'ACTIVE' ? 'danger' : 'secondary'}
                                size="sm"
                                onClick={() => handleToggleStatus(u)}
                              >
                                {u.status === 'ACTIVE' ? (
                                  <Lock className="w-3 h-3 mr-1" />
                                ) : (
                                  <Unlock className="w-3 h-3 mr-1" />
                                )}
                                {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: Alumni & Mentor Verification */}
      {activeTab === 'verifications' && (
        <Card orientation="vertical" padding="lg">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Alumni & Industry Mentor Credential Verification
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review registered alumni and corporate mentors to grant verified badges before they publish community posts or host student mock interviews.
            </p>
          </div>

          <div className="space-y-3">
            {users
              .filter((u) => u.role === 'ALUMNI' || u.role === 'MENTOR')
              .map((u) => {
                const isMentor = u.role === 'MENTOR';
                const profile = isMentor ? u.mentorProfile : u.alumniProfile;
                const isVerified = profile?.isVerified ?? false;

                return (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm">
                        {isMentor ? 'M' : 'A'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {profile?.fullName || u.email}
                          </span>
                          <Badge variant={isVerified ? 'success' : 'warning'} size="sm">
                            {isVerified ? 'Verified' : 'Pending Verification'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {profile?.currentRole || 'Role not specified'} at{' '}
                          {profile?.currentCompany || 'Company not specified'} • {u.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {profile && (
                        <Button
                          variant={isVerified ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() =>
                            handleVerifyProfile(
                              isMentor ? 'mentor' : 'alumni',
                              profile.id,
                              !isVerified
                            )
                          }
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                          {isVerified ? 'Revoke Verification' : 'Grant Verified Badge'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* TAB 3: Audit Logs */}
      {activeTab === 'audit' && (
        <Card orientation="vertical" padding="lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-slate-900 text-sm">System Security & Administrative Audit Trail</h3>
            <Button variant="outline" size="sm" onClick={fetchAuditLogs}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>

          {isLoadingAudit ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : auditLogs.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No Audit Records"
              description="Administrative actions, stage overrides, and role updates will be logged here."
            />
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 sticky top-0">
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Timestamp</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Action</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Entity</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Actor ID</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-indigo-700">{log.action}</td>
                      <td className="py-2.5 px-3 text-slate-800">{log.entityType}</td>
                      <td className="py-2.5 px-3 text-slate-600">{log.userId ? log.userId.slice(0, 8) + '...' : 'SYSTEM'}</td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs font-sans">
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB 4: System Config */}
      {activeTab === 'config' && (
        <Card orientation="vertical" padding="lg">
          <form onSubmit={handleSaveConfig} className="space-y-4">
            {configSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Configuration parameters updated and stored successfully.
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Configuration Key
              </label>
              <input
                type="text"
                value={configKey}
                onChange={(e) => setConfigKey(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                JSON Configuration Value
              </label>
              <textarea
                rows={10}
                value={configValue}
                onChange={(e) => setConfigValue(e.target.value)}
                className="w-full p-3 text-xs bg-slate-900 text-emerald-400 font-mono rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" type="submit" disabled={isSavingConfig}>
                {isSavingConfig ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Role Edit Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Assign System Role — ${editingUser.email}`}
          size="md"
        >
          <form onSubmit={handleSaveRole} className="space-y-4">
            <p className="text-xs text-slate-600">
              Modifying this account's role changes their access boundary across dashboard, opportunities management, and admin consoles immediately.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                New User Role *
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={isUpdatingRole}>
                {isUpdatingRole ? 'Updating...' : 'Save Role Change'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
