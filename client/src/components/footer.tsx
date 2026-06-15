import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hidden w-full py-4 px-container-padding bg-surface-container-low border-t border-surface-border text-on-surface-variant text-label-sm select-none transition-colors duration-200 mt-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 max-w-max-width mx-auto">
        <div>
          <span>&copy; {currentYear} EzCampaign B2B Admin portal. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-converted animate-pulse inline-block"></span>
            Twilio Sandbox Connected
          </span>
          <span className="opacity-50">|</span>
          <span>v1.0.2</span>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
