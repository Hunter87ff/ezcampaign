
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
        return <LeadDetailPage leadId={selectedLeadId} />;
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
