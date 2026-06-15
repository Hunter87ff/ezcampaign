
import React, { useState, useEffect } from 'react';
import { apiService } from './api';
import type { Page, User } from './types';

// Components
import Sidebar from './components/sidebar';
import Header from './components/header';
import Footer from './components/footer';

// Pages
import Login from './pages/login';
import DashboardIndex from './pages/dashboard';
import LeadsList from './pages/dashboard/leads';
import LeadDetailPage from './pages/dashboard/leadPage';
import CallLogsHistory from './pages/dashboard/logs';
import TemplatesList from './pages/dashboard/templates';
import SettingsPanel from './pages/dashboard/settings';

export const App: React.FC = () => {
  // Authentication State
  const [token, setToken] = useState<string | null>(apiService.getToken());
  const [user, setUser] = useState<User | null>(apiService.getCurrentUser());

  // Routing State
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Layout Controls
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('ez_dark_mode');
    if (savedTheme) return savedTheme === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Global Search state (Header filters items down in Leads, Logs, Templates)
  const [searchQuery, setSearchQuery] = useState('');

  // Sync theme changes with DOM node
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ez_dark_mode', String(darkMode));
  }, [darkMode]);

  // Auth Action Handlers
  const handleLoginSuccess = (newToken: string, loggedUser: User) => {
    setToken(newToken);
    setUser(loggedUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    apiService.logout();
    setToken(null);
    setUser(null);
    setCurrentPage('dashboard');
  };

  // Centralized 401 Unauthorized handler
  useEffect(() => {
    const handleUnauthorized = () => {
      handleLogout();
    };
    window.addEventListener('ez_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('ez_unauthorized', handleUnauthorized);
    };
  }, []);

  // Listen for profile changes to keep headers and sidebar info fresh
  useEffect(() => {
    const handleProfileUpdate = () => {
      setUser(apiService.getCurrentUser());
      setToken(apiService.getToken());
    };
    window.addEventListener('ez_profile_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('ez_profile_updated', handleProfileUpdate);
    };
  }, []);

  // Listen for rate limiting events
  useEffect(() => {
    const handleRateLimited = () => {
      setIsRateLimited(true);
    };
    window.addEventListener('ez_rate_limited', handleRateLimited);
    return () => {
      window.removeEventListener('ez_rate_limited', handleRateLimited);
    };
  }, []);

  // Rate limited fallback error page
  if (isRateLimited) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in select-none">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md shadow-lg flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 dark:text-amber-450 flex items-center justify-center mb-6 animate-pulse">
            <span className="material-symbols-outlined text-[36px]">warning</span>
          </div>
          <h1 className="font-sans font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
            Too Many Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-455 font-medium mt-2 leading-relaxed">
            You've exceeded the rate limit. To protect Twilio sandbox resources and prevent server abuse, please wait a moment before retrying.
          </p>
          <button
            onClick={() => {
              setIsRateLimited(false);
              window.location.reload();
            }}
            className="mt-6 px-6 py-2.5 bg-primary hover:opacity-95 text-white rounded-lg font-sans text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Retry Request
          </button>
        </div>
      </div>
    );
  }

  // Enforce Login view if not authenticated
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Active view renderer
  const renderActivePage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardIndex />;
      case 'leads':
        return (
          <LeadsList
            searchQuery={searchQuery}
            setSelectedLeadId={setSelectedLeadId}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'lead-detail':
        if (!selectedLeadId) {
          setCurrentPage('leads');
          return null;
        }
        return <LeadDetailPage leadId={selectedLeadId} setCurrentPage={setCurrentPage} />;
      case 'templates':
        return <TemplatesList searchQuery={searchQuery} />;
      case 'call-logs':
        return (
          <CallLogsHistory
            searchQuery={searchQuery}
            setSelectedLeadId={setSelectedLeadId}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'settings':
        return <SettingsPanel />;
      default:
        return <DashboardIndex />;
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-background dark:bg-surface-background text-on-surface transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-[260px] min-h-screen">
        {/* Navigation Toolbar */}
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dashboard Canvas Page viewport */}
        <main className="flex-1">
          {renderActivePage()}
        </main>

        {/* Subtle diagnostics status bar */}
        <Footer />
      </div>

    </div>
  );
};

export default App;
