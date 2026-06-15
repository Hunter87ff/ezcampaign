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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const targetEmail = email || 'admin@company.com';
    const targetPassword = password || 'Admin@123';

    setError(null);
    setLoading(true);

    try {
      const response = await apiService.login({ email: targetEmail, password: targetPassword });
      onLoginSuccess(response.token, response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  /*
  const handleGoogleSignIn = async () => {
    setEmail('admin@company.com');
    setPassword('Admin@123');
    setError(null);
    setLoading(true);
    // Simulate brief network delay for realism
    setTimeout(async () => {
      try {
        const response = await apiService.login({
          email: 'admin@company.com',
          password: 'Admin@123',
        });
        onLoginSuccess(response.token, response.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Google Auth simulation failed.');
        setLoading(false);
      }
    }, 800);
  };
  */

  const handleDemoAutofill = () => {
    setEmail('admin@company.com');
    setPassword('Admin@123');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-200">
      
      {/* Upper Logo Indicator */}
      <div className="flex items-center gap-2 mb-8 select-none">
        <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
          E
        </span>
        <span className="font-sans font-bold text-xl text-slate-800 dark:text-slate-200 tracking-tight">
          Ezcampaign
        </span>
      </div>

      <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 md:p-10 select-none animate-zoom-in relative">
        
        {/* Decorative subtle top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-emerald-500 to-teal-600 rounded-t-2xl" />

        {/* Title Block */}
        <div className="text-center mb-6">
          <h2 className="text-[28px] font-sans font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back
          </h2>
          <p className="text-body-md text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            Sign in to your Ezcampaign workspace
          </p>
        </div>

        {/* Error Block */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/35 text-red-600 dark:text-red-400 rounded-xl text-body-md flex items-center gap-2.5 animate-fade-in font-medium">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span className="text-xs leading-relaxed">{error}</span>
          </div>
        )}

        {/* Social Authentication */}
        {/* <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-sans font-semibold text-body-md hover:bg-slate-50 dark:hover:bg-slate-700/60 active:bg-slate-100 transition-all duration-150 shadow-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button> */}

        {/* Separator */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-x-0 h-[1px] bg-slate-200 dark:bg-slate-800" />
          <span className="relative px-3 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            or sign in with email
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Email address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-lg pl-10 pr-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 font-sans"
                placeholder="you@franchise.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Please contact your organization administrator to reset your password.");
                }}
                className="text-xs font-bold text-primary dark:text-primary-container hover:underline hover:opacity-90 transition-all"
              >
                Forgot password?
              </a>
            </div>
            
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-lg pl-10 pr-12 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 font-sans"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-primary text-white font-sans font-bold text-body-md rounded-lg hover:opacity-95 hover:shadow-md active:scale-[0.99] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Register Account Footer link */}
        <div className="mt-6 text-center text-body-md text-slate-500 dark:text-slate-400 font-medium">
          New to Ezcampaign?{' '}
          <a
            href="#signup"
            onClick={(e) => {
              e.preventDefault();
              handleDemoAutofill();
            }}
            className="text-primary dark:text-primary-container font-bold hover:underline"
          >
            Create a free account
          </a>
        </div>

      </div>

      {/* Demo helper panel styled discretely */}
      <div className="mt-8 text-center max-w-xs px-4">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal mb-2">
          Evaluating the platform? Use Google login or quick fill.
        </p>
        <button
          onClick={handleDemoAutofill}
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-container underline transition-colors cursor-pointer"
        >
          Autofill demo credentials
        </button>
      </div>

      {/* Privacy disclaimer */}
      <div className="mt-12 text-center text-[11px] text-slate-400 dark:text-slate-500 select-none">
        By signing in, you agree to our{' '}
        <a href="#privacy" className="underline hover:text-slate-500 dark:hover:text-slate-400">
          Privacy Policy
        </a>
        .
      </div>

    </div>
  );
};
export default Login;
