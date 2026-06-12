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
  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: 'dashboard' },
    { id: 'leads' as Page, label: 'Leads', icon: 'person_search' },
    { id: 'templates' as Page, label: 'Templates', icon: 'chat_bubble' },
    { id: 'call-logs' as Page, label: 'Call Logs', icon: 'call' },
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
        className={`fixed h-full w-[260px] left-0 top-0 z-40 bg-surface-container-lowest dark:bg-surface-container-lowest border-r border-surface-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-container-padding py-8 border-b border-surface-border">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-container">
                EzCampaign
              </h1>
              <p className="font-label-md text-label-md text-on-surface-variant opacity-70">
                Enterprise Admin
              </p>
            </div>
            {/* Close Button on Mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id || (item.id === 'leads' && currentPage === 'lead-detail');
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-base px-container-padding py-3 rounded-lg transition-all group font-body-md text-body-md ${
                  isActive
                    ? 'text-primary dark:text-primary-container font-bold border-r-4 border-primary bg-surface-container dark:bg-surface-container-low'
                    : 'text-on-surface-variant hover:text-primary dark:hover:text-primary-container hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Meta & Controls */}
        <div className="px-4 py-6 border-t border-surface-border space-y-1">
          <button
            onClick={() => {
              setCurrentPage('settings');
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-base px-container-padding py-2.5 rounded-lg transition-all font-body-md text-body-md ${
              currentPage === 'settings'
                ? 'text-primary dark:text-primary-container font-bold bg-surface-container dark:bg-surface-container-low'
                : 'text-on-surface-variant hover:text-primary dark:hover:text-primary-container hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Settings</span>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-base px-container-padding py-2.5 rounded-lg text-error hover:bg-error-container/20 transition-all font-body-md text-body-md mt-2"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
