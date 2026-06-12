import React, { useState } from 'react';
import { apiService } from '../api';
import type { User } from '../types';

interface LoginProps {
  onLoginSuccess: (token: string, user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await apiService.login({ email, password });
      onLoginSuccess(response.token, response.user);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAutofill = () => {
    setEmail('admin@company.com');
    setPassword('Admin@123');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-background dark:bg-surface-background p-6 transition-colors duration-200">
      <div className="w-full max-w-md bg-surface-container-lowest border border-surface-border rounded-2xl shadow-lg p-8 relative overflow-hidden select-none animate-zoom-in">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

        {/* Title Block */}
        <div className="text-center mb-8">
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-container">
            EzCampaign
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1.5">
            B2B WhatsApp Campaign Portal
          </p>
        </div>

        {/* Error Block */}
        {error && (
          <div className="mb-6 p-4 bg-error-container/20 border border-error-container text-error rounded-xl text-body-md flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-border rounded-lg pl-10 pr-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/30"
                placeholder="admin@company.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-label-md font-label-md text-on-surface uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-border rounded-lg pl-10 pr-12 py-2.5 text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/30"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary font-bold rounded-lg hover:opacity-95 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Logging in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Quick Demo Autofill Panel */}
        <div className="mt-8 pt-6 border-t border-surface-border text-center">
          <p className="text-label-sm text-on-surface-variant mb-3">
            Testing or evaluating the dashboard?
          </p>
          <button
            onClick={handleDemoAutofill}
            className="px-4 py-2 border border-surface-border rounded-lg text-label-md font-bold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            Use Demo Credentials
          </button>
        </div>

      </div>
    </div>
  );
};
export default Login;
