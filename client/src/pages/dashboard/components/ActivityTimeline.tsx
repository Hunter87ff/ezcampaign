import React from 'react';
import type { ActivityLog } from '../../../types';

interface ActivityTimelineProps {
  activities: ActivityLog[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  // Relative time formatter
  const formatActivityTime = (dateStr: string) => {
    // eslint-disable-next-line react-hooks/purity
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60); // Note: fixed index.tsx bug where it divided by 600

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  // Resolve action-specific icon style
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'message_sent':
        return {
          name: 'send',
          bg: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/35',
        };
      case 'call_initiated':
        return {
          name: 'call',
          bg: 'bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/35',
        };
      case 'lead_created':
        return {
          name: 'person_add',
          bg: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/35',
        };
      case 'reply_received':
        return {
          name: 'chat_bubble',
          bg: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/35',
        };
      default:
        return {
          name: 'info',
          bg: 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/50',
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-full select-none text-left">
      {/* Header Block */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center select-none">
        <div>
          <h4 className="font-sans font-bold text-sm text-slate-800 dark:text-slate-200">
            Recent Activity
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Live campaign action records
          </p>
        </div>
        <span className="text-[10px] font-sans font-bold bg-primary/10 text-primary dark:bg-primary-container/20 dark:text-emerald-400 px-2.5 py-1 rounded-full flex items-center gap-1.5 leading-none">
          <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-emerald-400 animate-pulse" />
          Live Feed
        </span>
      </div>

      {/* Timeline scroll container */}
      <div className="flex-1 overflow-y-auto max-h-[350px] chat-scroll p-5 relative">
        {activities.length > 0 ? (
          <div className="relative border-l border-slate-100 dark:border-slate-800 ml-3.5 pl-6 space-y-6 py-2">
            {activities.map((act) => {
              const icon = getActivityIcon(act.action);
              return (
                <div key={act._id} className="relative animate-fade-in text-left">
                  {/* Timeline point box absolute overlay */}
                  <div className={`absolute -left-[37px] top-0 p-1.5 ${icon.bg} border rounded-full shrink-0 flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-[14px]">{icon.name}</span>
                  </div>

                  {/* Activity Details panel */}
                  <div className="leading-tight">
                    <div className="flex justify-between items-start gap-4">
                      <p className="font-sans text-xs text-slate-800 dark:text-slate-200 leading-normal font-semibold">
                        {act.details?.message || (
                          <>
                            Action <span className="font-bold">{act.action}</span> executed.
                          </>
                        )}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold shrink-0">
                        {formatActivityTime(act.createdAt)}
                      </span>
                    </div>

                    {/* Detailed message body */}
                    {act.details?.body && (
                      <div className="mt-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800/60 max-w-lg">
                        <p className="text-[10.5px] font-sans text-slate-500 dark:text-slate-400 font-medium italic">
                          "{act.details.body}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium text-xs">
            No recent platform activity logged.
          </div>
        )}
      </div>
    </div>
  );
};
export default ActivityTimeline;
