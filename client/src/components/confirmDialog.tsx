import React, { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  onConfirm,
  onCancel,
}) => {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  // Configuration based on type
  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'warning',
          iconClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450',
          confirmBtnClass: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-rose-600/10 focus:ring-rose-500/20',
          accentBorder: 'border-t-4 border-t-rose-500',
        };
      case 'warning':
        return {
          icon: 'report_problem',
          iconClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450',
          confirmBtnClass: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-amber-600/10 focus:ring-amber-500/20',
          accentBorder: 'border-t-4 border-t-amber-500',
        };
      case 'info':
      default:
        return {
          icon: 'info',
          iconClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450',
          confirmBtnClass: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-600/10 focus:ring-blue-500/20',
          accentBorder: 'border-t-4 border-t-blue-500',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onCancel}
      />
      
      {/* Dialog box wrapper */}
      <div 
        className={`w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl border border-slate-150 dark:border-slate-800/80 overflow-hidden relative z-10 transition-all transform duration-300 animate-zoom-in ${config.accentBorder}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Content panel */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Visual Icon */}
            <div className={`p-3 rounded-xl shrink-0 flex items-center justify-center ${config.iconClass}`}>
              <span className="material-symbols-outlined text-[24px] select-none">
                {config.icon}
              </span>
            </div>
            
            {/* Text details */}
            <div className="space-y-1.5 flex-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        {/* Actions panel */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700/80 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-350 text-xs font-bold font-sans transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500/20 active:scale-98"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 active:scale-98 ${config.confirmBtnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
