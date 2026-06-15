import React, { useEffect, useState } from 'react';
import { apiService } from '../../api';
import type { CallLog, Lead } from '../../types';

interface CallLogsProps {
  searchQuery: string;
  setSelectedLeadId: (id: string | null) => void;
  setCurrentPage: (page: 'dashboard' | 'leads' | 'lead-detail' | 'templates' | 'call-logs' | 'settings') => void;
}

export const CallLogsHistory: React.FC<CallLogsProps> = ({
  searchQuery,
  setSelectedLeadId,
  setCurrentPage,
}) => {
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 8;

  const fetchCallLogs = async () => {
    setLoading(true);
    try {
      const callData = await apiService.getCallLogs();
      const leadData = await apiService.getLeads();
      setLogs(callData);
      setLeads(leadData);
      setCurrentPageNum(1); // Reset page on query
    } catch (err) {
      console.error('Failed to load call logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCallLogs();
  }, [searchQuery]);

  // Robust lead info mapper that handles populated objects or simple string IDs
  const getLeadInfo = (leadId: string | Lead | null | undefined) => {
    if (leadId && typeof leadId === 'object') {
      return {
        name: leadId.name || 'Unknown Lead',
        businessType: leadId.businessType || 'other',
        _id: leadId._id || '',
      };
    }
    const found = leads.find((l) => l._id === leadId);
    return found 
      ? { name: found.name, businessType: found.businessType, _id: found._id } 
      : { name: 'Unknown Lead', businessType: 'other', _id: (leadId as string) || '' };
  };

  // Filter logs based on Header search query
  const filteredLogs = logs.filter((log) => {
    const info = getLeadInfo(log.leadId);
    const query = searchQuery.toLowerCase();
    return (
      info.name.toLowerCase().includes(query) ||
      log.phoneNumber.includes(query) ||
      log.status.toLowerCase().includes(query)
    );
  });

  // Stats Calculations
  const totalCalls = filteredLogs.length;
  const completedCalls = filteredLogs.filter((l) => l.status === 'completed');
  const completedCount = completedCalls.length;
  const totalDurationSecs = completedCalls.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const avgDurationSecs = completedCount > 0 ? Math.round(totalDurationSecs / completedCount) : 0;
  const successRate = totalCalls > 0 ? Math.round((completedCount / totalCalls) * 100) : 0;

  // Pagination Calculations
  const indexOfLastItem = currentPageNum * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const getStatusBadgeStyle = (status: CallLog['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
      case 'initiated':
      case 'ringing':
      case 'in-progress':
        return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50';
      case 'no-answer':
      case 'busy':
      case 'failed':
        return 'bg-rose-50 text-rose-600 border-rose-205 dark:bg-rose-950/30 dark:text-rose-450 dark:border-rose-900/50';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/50';
    }
  };

  const formatDuration = (secs?: number) => {
    if (!secs) return '0m 00s';
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem < 10 ? '0' : ''}${rem}s`;
  };

  const formatBusinessTypeLabel = (type: string) => {
    return type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-6 max-w-[1440px] mx-auto animate-fade-in select-none">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div className="text-left">
          <h2 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
            Voice Call Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Review detailed reports of Twilio voice simulations dispatched to lead numbers.
          </p>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Calls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-3xs hover:shadow-2xs transition-all duration-200">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">call</span>
          </div>
          <div className="text-left">
            <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Calls</span>
            <span className="text-lg font-sans font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5 block">{totalCalls}</span>
          </div>
        </div>

        {/* Card 2: Connected Calls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-3xs hover:shadow-2xs transition-all duration-200">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">phone_in_talk</span>
          </div>
          <div className="text-left">
            <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Connected</span>
            <span className="text-lg font-sans font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5 block">{completedCount}</span>
          </div>
        </div>

        {/* Card 3: Avg Duration */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-3xs hover:shadow-2xs transition-all duration-200">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">timer</span>
          </div>
          <div className="text-left">
            <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Avg. Duration</span>
            <span className="text-lg font-sans font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5 block">{formatDuration(avgDurationSecs)}</span>
          </div>
        </div>

        {/* Card 4: Success Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-3xs hover:shadow-2xs transition-all duration-200">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <div className="text-left">
            <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Success Rate</span>
            <span className="text-lg font-sans font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5 block">{successRate}%</span>
          </div>
        </div>
      </div>

      {/* Table & Cards Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-semibold text-xs text-slate-500">Reading logs...</span>
          </div>
        ) : filteredLogs.length > 0 ? (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 select-none">
                    <th className="px-4 py-2.5 text-[9px] font-sans font-bold uppercase tracking-wider">Recipient Name</th>
                    <th className="px-4 py-2.5 text-[9px] font-sans font-bold uppercase tracking-wider">Phone Number</th>
                    <th className="px-4 py-2.5 text-[9px] font-sans font-bold uppercase tracking-wider">Business Segment</th>
                    <th className="px-4 py-2.5 text-[9px] font-sans font-bold uppercase tracking-wider">Call Status</th>
                    <th className="px-4 py-2.5 text-[9px] font-sans font-bold uppercase tracking-wider">Start Time</th>
                    <th className="px-4 py-2.5 text-[9px] font-sans font-bold uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-2.5 text-[9px] font-sans font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-250">
                  {currentLogs.map((log) => {
                    const info = getLeadInfo(log.leadId);
                    return (
                      <tr key={log._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors duration-150 group">
                        <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">
                          <button
                            onClick={() => {
                              setSelectedLeadId(info._id);
                              setCurrentPage('lead-detail');
                            }}
                            className="hover:text-primary dark:hover:text-emerald-400 hover:underline font-bold text-left cursor-pointer transition-colors flex items-center gap-2"
                          >
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-355 flex items-center justify-center font-bold text-[9px] border border-slate-200/50 dark:border-slate-700/50">
                              {getInitials(info.name)}
                            </div>
                            <span className="font-sans text-xs">{info.name}</span>
                          </button>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                          {log.phoneNumber}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100/70 dark:bg-slate-800/80 text-slate-500 dark:text-slate-450 border border-slate-200/40 dark:border-slate-700/50 text-[9px] font-bold">
                            {formatBusinessTypeLabel(info.businessType)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold capitalize ${getStatusBadgeStyle(log.status)}`}>
                            {log.status.split('-').join(' ')}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-455 dark:text-slate-500">
                          {new Date(log.startTime).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-primary dark:text-emerald-400 text-xs">
                          {log.status === 'completed' ? formatDuration(log.duration) : '--'}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedLeadId(info._id);
                              setCurrentPage('lead-detail');
                            }}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer flex items-center justify-center ml-auto"
                            title="Open Recipient Conversation"
                          >
                            <span className="material-symbols-outlined text-[18px]">chat</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE RESPONSIVE CARDS VIEW */}
            <div className="md:hidden flex flex-col gap-2.5 p-3">
              {currentLogs.map((log) => {
                const info = getLeadInfo(log.leadId);
                return (
                  <div
                    key={log._id}
                    onClick={() => {
                      setSelectedLeadId(info._id);
                      setCurrentPage('lead-detail');
                    }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/85 p-3 rounded-xl shadow-3xs hover:border-primary/40 transition-all text-left flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-355 flex items-center justify-center font-bold text-xs shrink-0 shadow-3xs border border-slate-200/50 dark:border-slate-700/50">
                        {getInitials(info.name)}
                      </div>
                      <div className="text-left">
                        <h4 className="font-sans font-bold text-xs text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight">
                          {info.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-450 dark:text-slate-500">
                            {log.phoneNumber}
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">•</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">
                            {formatBusinessTypeLabel(info.businessType)}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block mt-1">
                          {new Date(log.startTime).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <span className={`px-2 py-0.5 rounded-full border text-[8px] font-bold capitalize ${getStatusBadgeStyle(log.status)}`}>
                        {log.status.split('-').join(' ')}
                      </span>
                      <span className="text-[10px] font-bold text-primary dark:text-emerald-400">
                        {log.status === 'completed' ? formatDuration(log.duration) : '--'}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedLeadId(info._id);
                          setCurrentPage('lead-detail');
                        }}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 hover:text-slate-650 dark:hover:text-slate-205 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 rounded-b-xl">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length} entries
              </span>
              
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPageNum === 1}
                  onClick={() => setCurrentPageNum((prev) => prev - 1)}
                  className="p-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-slate-605 dark:text-slate-350"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                
                {Array.from({ length: totalPages }).map((_, pageIdx) => (
                  <button
                    key={pageIdx}
                    onClick={() => setCurrentPageNum(pageIdx + 1)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      currentPageNum === pageIdx + 1
                        ? 'bg-primary text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-805 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {pageIdx + 1}
                  </button>
                ))}

                <button
                  disabled={currentPageNum === totalPages}
                  onClick={() => setCurrentPageNum((prev) => prev + 1)}
                  className="p-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-slate-605 dark:text-slate-350"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 border-none font-bold text-xs">
            No voice call logs found.
          </div>
        )}
      </div>

    </div>
  );
};
export default CallLogsHistory;
