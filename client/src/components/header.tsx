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
        return 'Contacts';
      case 'lead-detail':
        return 'Lead Profile';
      case 'templates':
        return 'Templates';
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
    <header className="sticky top-0 z-30 flex justify-between items-center px-6 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 select-none transition-colors duration-200">
      
      {/* Left section: Hamburger / Back Button / Title */}
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar Button (visible on mobile/tablet) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          aria-label="Toggle Navigation Sidebar"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Back Button (Only on detail views) */}
        {isDetailView && (
          <button
            onClick={() => setCurrentPage('leads')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
            title="Go Back to Leads List"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
        )}

        <h2 className="font-sans font-bold text-base text-slate-950 dark:text-white tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      {/* Middle section: Sleek Search Bar */}
      <div className="hidden md:flex items-center max-w-xs w-full relative select-none mx-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-450 dark:text-slate-500 text-[18px]">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 text-slate-700 dark:text-slate-200 font-semibold font-sans"
          placeholder="Search leads, logs, templates..."
        />
      </div>


      {/* Right section: Theme Utility / User block */}
      <div className="flex items-center gap-3">
        {/* Light/Dark mode toggler pill */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-sans text-xs font-bold transition-all cursor-pointer shadow-2xs"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="material-symbols-outlined text-[16px]">
            {darkMode ? 'dark_mode' : 'light_mode'}
          </span>
          <span className="capitalize">{darkMode ? 'Dark' : 'Light'}</span>
        </button>

        {/* Profile Avatar Card */}
        {user && (
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
            <button
              onClick={() => setCurrentPage('settings')}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-primary transition-all shrink-0"
              title="View Profile Settings"
            >
              <img
                alt="Profile Avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOAC_YWHf8svRrPyPGctKJVExvSFTQIWSIiFxF2gJmfzjlRDkPeyHC0k3-GSaTayyembztgnTSguFNFVcrpJ-iUqxjvFvnt4KRrXgrynBjy1LKOUpby5vyyO8-uJcqf0iE5iLE1jjxa-otk8gBsmhrWAVn3EhE1EMUSWbAa-PeRFQ9iK6asbxyYL-MHkEfMj-j6bAhof__MfuvHDhoyOfAz0ZV8g7FLJOH1ziVAyuOLiRhtLJ3o3zB6IlO9KuWlxUxRa1ezxiBvng"
              />
            </button>
            <div className="hidden md:block text-left leading-none">
              <p className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200">
                {user.name}
              </p>
              <p className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider mt-0.5">
                {user.role}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
