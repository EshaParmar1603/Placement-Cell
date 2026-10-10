import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { GraduationCap, Lock, Mail, ArrowRight, Sparkles, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Failed to sign in. Please verify your email and password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setError(null);
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
          Welcome back to PlaceWise
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          AI-powered campus placement cell management and career acceleration platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@placewise.edu"
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Quick Demo Logins (Password: Password@123)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoFill('student@placewise.edu')}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors"
              >
                <span className="font-semibold text-slate-800 block">Student</span>
                <span className="text-[10px] text-slate-400 block truncate">student@placewise.edu</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('manager@placewise.edu')}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors"
              >
                <span className="font-semibold text-slate-800 block">Placement Manager</span>
                <span className="text-[10px] text-slate-400 block truncate">manager@placewise.edu</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@placewise.edu')}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors"
              >
                <span className="font-semibold text-slate-800 block">Administrator</span>
                <span className="text-[10px] text-slate-400 block truncate">admin@placewise.edu</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('mentor@placewise.edu')}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors"
              >
                <span className="font-semibold text-slate-800 block">Mentor</span>
                <span className="text-[10px] text-slate-400 block truncate">mentor@placewise.edu</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
