import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { GraduationCap, User, Mail, Lock, Building, Briefcase, Hash } from 'lucide-react';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Student fields
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [course, setCourse] = useState('B.Tech');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [cgpa, setCgpa] = useState('8.0');

  // Alumni / Mentor fields
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [yearsExperience, setYearsExperience] = useState('3');
  const [expertise, setExpertise] = useState('System Design, Coding, Backend');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload: any = {
        role,
        fullName,
        email,
        password,
        phone,
      };

      if (role === 'STUDENT') {
        payload.enrollmentNumber = enrollmentNumber;
        payload.department = department;
        payload.course = course;
        payload.graduationYear = parseInt(graduationYear, 10);
        payload.cgpa = parseFloat(cgpa);
      } else if (role === 'ALUMNI') {
        payload.department = department;
        payload.graduationYear = parseInt(graduationYear, 10);
        payload.currentCompany = currentCompany;
        payload.currentRole = currentRole;
      } else if (role === 'MENTOR') {
        payload.currentCompany = currentCompany;
        payload.currentRole = currentRole;
        payload.yearsExperience = parseInt(yearsExperience, 10);
        payload.expertise = expertise.split(',').map((s) => s.trim()).filter(Boolean);
      }

      await register(payload);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Registration failed. Please check the inputs.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/25">
            <GraduationCap className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create PlaceWise Account
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">
          Join your university campus placement and mentorship network
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl mb-6">
            {(['STUDENT', 'ALUMNI', 'MENTOR'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2 text-xs font-semibold rounded-lg transition-all capitalize ${
                  role === r
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r.toLowerCase()}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                leftIcon={<Lock className="w-4 h-4" />}
              />
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>

            {/* Student Specific Fields */}
            {role === 'STUDENT' && (
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-4 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Enrollment Number"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    placeholder="EN2022CSE099"
                    required
                    leftIcon={<Hash className="w-4 h-4" />}
                  />
                  <Select
                    label="Department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    options={[
                      { label: 'Computer Science', value: 'Computer Science' },
                      { label: 'Information Technology', value: 'Information Technology' },
                      { label: 'Electronics & Comm', value: 'Electronics & Comm' },
                      { label: 'Electrical Engineering', value: 'Electrical' },
                      { label: 'Mechanical Engineering', value: 'Mechanical' },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="B.Tech"
                  />
                  <Input
                    label="Graduation Year"
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    required
                  />
                  <Input
                    label="Current CGPA"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Alumni Specific Fields */}
            {role === 'ALUMNI' && (
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-4 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Graduated Department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    options={[
                      { label: 'Computer Science', value: 'Computer Science' },
                      { label: 'Information Technology', value: 'Information Technology' },
                      { label: 'Electronics & Comm', value: 'Electronics & Comm' },
                    ]}
                  />
                  <Input
                    label="Graduation Year"
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Current Company"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder="e.g. Google, Amazon"
                    leftIcon={<Building className="w-4 h-4" />}
                  />
                  <Input
                    label="Current Job Role"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder="e.g. Software Engineer II"
                    leftIcon={<Briefcase className="w-4 h-4" />}
                  />
                </div>
              </div>
            )}

            {/* Mentor Specific Fields */}
            {role === 'MENTOR' && (
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-4 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Current Organization"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder="e.g. Microsoft"
                    leftIcon={<Building className="w-4 h-4" />}
                  />
                  <Input
                    label="Designation / Role"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder="e.g. Principal Architect"
                    leftIcon={<Briefcase className="w-4 h-4" />}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Years of Industry Experience"
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                  />
                  <Input
                    label="Domain Expertise (comma-separated)"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="System Design, Backend, Coding"
                  />
                </div>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full mt-4" isLoading={isLoading}>
              Complete Registration
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
