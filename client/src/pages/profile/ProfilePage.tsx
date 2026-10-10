import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { studentsApi } from '../../api/students';
import { useAuth } from '../../context/AuthContext';
import { PlacementStatus } from '../../types';
import {
  UserCircle,
  GraduationCap,
  Award,
  BookOpen,
  Briefcase,
  MapPin,
  Save,
  CheckCircle2,
  Plus,
  X,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    department: '',
    course: '',
    graduationYear: 2026,
    cgpa: 0,
    percentage: 0,
    tenthPercentage: 0,
    twelfthPercentage: 0,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    skills: [] as string[],
    targetRoles: [] as string[],
    preferredLocations: [] as string[],
    placementStatus: 'NOT_PLACED' as PlacementStatus,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['myProfileDetails'],
    queryFn: () => studentsApi.getMyProfile(),
    enabled: user?.role === 'STUDENT',
  });

  useEffect(() => {
    if (data?.data) {
      const p = data.data;
      setFormData({
        fullName: p.fullName || '',
        phone: p.phone || '',
        department: p.department || '',
        course: p.course || '',
        graduationYear: p.graduationYear || 2026,
        cgpa: p.cgpa || 0,
        percentage: p.percentage || 0,
        tenthPercentage: p.tenthPercentage || 0,
        twelfthPercentage: p.twelfthPercentage || 0,
        activeBacklogs: p.activeBacklogs || 0,
        historyOfBacklogs: p.historyOfBacklogs || 0,
        skills: p.skills || [],
        targetRoles: p.targetRoles || [],
        preferredLocations: p.preferredLocations || [],
        placementStatus: p.placementStatus || 'NOT_PLACED',
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => studentsApi.updateMyProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfileDetails'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (!formData.skills.includes(newSkillInput.trim())) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, newSkillInput.trim()] }));
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const profile = data?.data;

  return (
    <div>
      <Header
        onOpenSidebar={openSidebar}
        title="My Profile & Academic Record"
        subtitle="Manage personal academic metrics, technical skills, and placement eligibility status"
      />

      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
        {/* Profile Completion Card */}
        <Card className="bg-gradient-to-r from-brand-900 to-indigo-900 text-white">
          <CardBody className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300">
                  Profile Strength Index
                </span>
                <h3 className="text-xl font-bold mt-0.5">
                  {profile?.profileCompletion || 0}% Complete
                </h3>
              </div>
              <span className="text-xs text-brand-200">
                A 100% completed profile receives higher ranking in company shortlists
              </span>
            </div>
            <ProgressBar
              value={profile?.profileCompletion || 0}
              size="lg"
              color="emerald"
            />
          </CardBody>
        </Card>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Profile and academic credentials updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-brand-600" />
                  <span>Personal Details</span>
                </div>
              }
            />
            <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
              />
              <Input
                label="University Email"
                value={user?.email || ''}
                disabled
                helperText="Email is bound to student account"
              />
              <Input
                label="Enrollment Identifier"
                value={profile?.enrollmentNumber || ''}
                disabled
                helperText="Verified student identifier"
              />
            </CardBody>
          </Card>

          {/* Academic Records */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-brand-600" />
                  <span>Academic Record & Eligibility</span>
                </div>
              }
            />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  options={[
                    { label: 'Computer Science', value: 'Computer Science' },
                    { label: 'Information Technology', value: 'Information Technology' },
                    { label: 'Electronics & Comm', value: 'Electronics & Comm' },
                    { label: 'Mechanical', value: 'Mechanical' },
                    { label: 'Electrical', value: 'Electrical' },
                  ]}
                />
                <Input
                  label="Course / Degree"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
                <Input
                  label="Graduation Year"
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value, 10) })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                <Input
                  label="Current CGPA"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) })}
                  required
                />
                <Input
                  label="Equivalent Percentage"
                  type="number"
                  step="0.1"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) })}
                />
                <Input
                  label="10th Grade (%)"
                  type="number"
                  step="0.1"
                  value={formData.tenthPercentage}
                  onChange={(e) => setFormData({ ...formData, tenthPercentage: parseFloat(e.target.value) })}
                />
                <Input
                  label="12th Grade (%)"
                  type="number"
                  step="0.1"
                  value={formData.twelfthPercentage}
                  onChange={(e) => setFormData({ ...formData, twelfthPercentage: parseFloat(e.target.value) })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Active Backlogs (Current)"
                  type="number"
                  min="0"
                  value={formData.activeBacklogs}
                  onChange={(e) => setFormData({ ...formData, activeBacklogs: parseInt(e.target.value, 10) })}
                  required
                />
                <Input
                  label="History of Backlogs (Total)"
                  type="number"
                  min="0"
                  value={formData.historyOfBacklogs}
                  onChange={(e) => setFormData({ ...formData, historyOfBacklogs: parseInt(e.target.value, 10) })}
                  required
                />
              </div>
            </CardBody>
          </Card>

          {/* Technical Toolkit */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-600" />
                  <span>Technical & Soft Skills</span>
                </div>
              }
            />
            <CardBody className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill (e.g. React, PostgreSQL, Docker, Java)..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddSkill} leftIcon={<Plus className="w-4 h-4" />}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold rounded-lg"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-brand-400 hover:text-brand-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Placement Status & Preferences */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-brand-600" />
                  <span>Placement Preferences</span>
                </div>
              }
            />
            <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Placement Status"
                value={formData.placementStatus}
                onChange={(e) => setFormData({ ...formData, placementStatus: e.target.value as PlacementStatus })}
                options={[
                  { label: 'Seeking Campus Placement (Active)', value: 'NOT_PLACED' },
                  { label: 'Already Placed', value: 'PLACED' },
                  { label: 'Pursuing Higher Studies', value: 'HIGHER_STUDIES' },
                  { label: 'Opted Out of Placements', value: 'OPTED_OUT' },
                ]}
              />

              <Input
                label="Target Job Roles (comma-separated)"
                value={formData.targetRoles.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetRoles: e.target.value.split(',').map((r) => r.trim()).filter(Boolean),
                  })
                }
                placeholder="Software Engineer, Cloud Architect"
              />
            </CardBody>
          </Card>

          {/* Submit Action */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              size="lg"
              isLoading={updateMutation.isPending}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
