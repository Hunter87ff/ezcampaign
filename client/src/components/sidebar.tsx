import React from 'react';
import type { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setCurrentPage,
  isOpen,
  setIsOpen,
  onLogout,
}) => {

  // Functional items
  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: 'dashboard', active: true },
    { id: 'leads' as Page, label: 'Contacts', icon: 'person_search', active: true },
    { id: 'call-logs' as Page, label: 'Call Logs', icon: 'call', active: true },
    { id: 'templates' as Page, label: 'Campaigns', icon: 'campaign', active: true },
  ];

  // Inactive placeholders to match screenshot_0
  const placeholderItems = [
    { label: 'Knowledge Base', icon: 'menu_book' },
    // { label: 'Content Generator', icon: 'auto_awesome' },
    // { label: 'Event Calendar', icon: 'calendar_today' },
  ];

  const placeholderBottomItems = [
    // { label: 'Public Profile', icon: 'public' },
    // { label: 'Billing', icon: 'payments' },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed h-full w-[260px] left-0 top-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-white font-bold text-sm shadow-xs">
              E
            </span>
            <span className="font-sans font-bold text-lg text-primary dark:text-emerald-400 tracking-tight">
              Ezcampaign
            </span>
          </div>
          {/* Close Button on Mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto chat-scroll select-none">
          {/* Functional Menu Items */}
          {menuItems.map((item) => {
            const isActive =
              currentPage === item.id ||
              (item.id === 'leads' && currentPage === 'lead-detail');
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-sans text-xs font-semibold ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary-container/25 dark:text-emerald-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Inactive Placeholders */}
          {placeholderItems.map((item) => (
            <button
              key={item.label}
              disabled
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg font-sans text-xs font-medium text-slate-400 dark:text-slate-500 opacity-70 cursor-not-allowed"
              title="Coming Soon"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </button>
          ))}

          {/* Divider */}
          <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-4" />

          {/* Lower Placeholders */}
          {placeholderBottomItems.map((item) => (
            <button
              key={item.label}
              disabled
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg font-sans text-xs font-medium text-slate-400 dark:text-slate-500 opacity-70 cursor-not-allowed"
              title="Coming Soon"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer Details */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 space-y-1 select-none bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => {
              setCurrentPage('settings');
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-sans text-xs font-semibold ${
              currentPage === 'settings'
                ? 'bg-primary/10 text-primary dark:bg-primary-container/25 dark:text-emerald-300 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span>Settings</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-sans text-xs font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
