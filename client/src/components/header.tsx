import React from 'react';
import type { Page, User } from '../types';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: User | null;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  setCurrentPage,
  setSidebarOpen,
  user,
  darkMode,
  setDarkMode,
  searchQuery,
  setSearchQuery,
}) => {
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'leads':
        return 'Leads Management';
      case 'lead-detail':
        return 'Lead Profile';
      case 'templates':
        return 'Message Templates';
      case 'call-logs':
        return 'Call Logs';
      case 'settings':
        return 'Settings';
      default:
        return 'Campaign Manager';
    }
  };

  const isDetailView = currentPage === 'lead-detail';

  return (
    <header className="sticky top-0 z-30 flex justify-between items-center px-container-padding h-16 bg-surface-container-lowest border-b border-surface-border text-on-surface select-none transition-colors duration-200">
      
      {/* Left section: Hamburger / Back Button / Title */}
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar Button (visible on mobile/tablet) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-full hover:bg-surface-container-low transition-colors"
          aria-label="Toggle Navigation Sidebar"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Back Button (Only on detail views) */}
        {isDetailView && (
          <button
            onClick={() => setCurrentPage('leads')}
            className="p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
            title="Go Back to Leads List"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        )}

        <h2 className="font-headline-md text-headline-md font-bold text-text-primary dark:text-text-primary tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      {/* Middle section: Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-surface-border rounded-lg pl-10 pr-4 py-1.5 text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/50"
            placeholder="Search leads, logs, templates..."
          />
        </div>
      </div>

      {/* Right section: System Utilities / Avatar */}
      <div className="flex items-center gap-4">
        {/* Light/Dark mode toggler */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="material-symbols-outlined text-[22px]">
            {darkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Notifications Icon */}
        <button
          className="relative p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-status-new border-2 border-surface-container-lowest rounded-full"></span>
        </button>

        {/* Admin profile detail block */}
        {user && (
          <div className="flex items-center gap-3 border-l border-surface-border pl-4">
            <div className="hidden sm:block text-right">
              <p className="font-label-md text-label-md font-bold text-on-surface">
                {user.name}
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                {user.role}
              </p>
            </div>
            <img
              alt="Admin Profile"
              className="w-9 h-9 rounded-full bg-primary-container object-cover border border-surface-border"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOAC_YWHf8svRrPyPGctKJVExvSFTQIWSIiFxF2gJmfzjlRDkPeyHC0k3-GSaTayyembztgnTSguFNFVcrpJ-iUqxjvFvnt4KRrXgrynBjy1LKOUpby5vyyO8-uJcqf0iE5iLE1jjxa-otk8gBsmhrWAVn3EhE1EMUSWbAa-PeRFQ9iK6asbxyYL-MHkEfMj-j6bAhof__MfuvHDhoyOfAz0ZV8g7FLJOH1ziVAyuOLiRhtLJ3o3zB6IlO9KuWlxUxRa1ezxiBvng"
            />
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
