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
    fetchCallLogs();
  }, [searchQuery]);

  // Map lead name/business type helper
  const getLeadInfo = (leadId: string) => {
    const found = leads.find((l) => l._id === leadId);
    return found ? { name: found.name, businessType: found.businessType } : { name: 'Unknown Lead', businessType: 'other' };
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

  // Pagination Calculations
  const indexOfLastItem = currentPageNum * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const getStatusBadgeStyle = (status: CallLog['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-status-converted/10 text-status-converted border-status-converted/25';
      case 'initiated':
      case 'ringing':
      case 'in-progress':
        return 'bg-status-new/10 text-status-new border-status-new/20';
      case 'no-answer':
      case 'busy':
      case 'failed':
        return 'bg-error-container/20 text-error border-error-container';
      default:
        return 'bg-surface-container text-on-surface-variant border-surface-border';
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

  return (
    <div className="p-container-padding max-w-max-width mx-auto animate-fade-in select-none">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-text-primary dark:text-text-primary">
            Call Logs History
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Review detailed reports of Twilio voice actions dispatched to lead numbers.
          </p>
        </div>
      </div>

      {/* Call Logs Table */}
      <div className="bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-semibold text-body-md">Reading logs...</span>
          </div>
        ) : filteredLogs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-border text-on-surface-variant">
                    <th className="px-container-padding py-4 text-label-md font-label-md uppercase tracking-wider">Recipient Name</th>
                    <th className="px-container-padding py-4 text-label-md font-label-md uppercase tracking-wider">Phone Number</th>
                    <th className="px-container-padding py-4 text-label-md font-label-md uppercase tracking-wider">Business segment</th>
                    <th className="px-container-padding py-4 text-label-md font-label-md uppercase tracking-wider">Call status</th>
                    <th className="px-container-padding py-4 text-label-md font-label-md uppercase tracking-wider">Start Time</th>
                    <th className="px-container-padding py-4 text-label-md font-label-md uppercase tracking-wider">Duration</th>
                    <th className="px-container-padding py-4 text-label-md font-label-md uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-on-surface">
                  {currentLogs.map((log) => {
                    const info = getLeadInfo(log.leadId);

                    return (
                      <tr key={log._id} className="hover:bg-surface-container-low/50 transition-colors duration-150 group font-body-md text-body-md">
                        <td className="px-container-padding py-4 font-bold text-text-primary dark:text-text-primary">
                          <button
                            onClick={() => {
                              setSelectedLeadId(log.leadId);
                              setCurrentPage('lead-detail');
                            }}
                            className="hover:text-primary hover:underline font-bold text-left cursor-pointer transition-colors"
                          >
                            {info.name}
                          </button>
                        </td>
                        <td className="px-container-padding py-4 font-semibold text-on-surface-variant">
                          {log.phoneNumber}
                        </td>
                        <td className="px-container-padding py-4">
                          <span className="px-2 py-0.5 rounded bg-surface-container border border-surface-border text-label-sm font-label-sm font-semibold text-on-surface-variant">
                            {formatBusinessTypeLabel(info.businessType)}
                          </span>
                        </td>
                        <td className="px-container-padding py-4">
                          <span className={`px-2.5 py-0.5 rounded-full border text-label-sm font-label-sm font-bold capitalize ${getStatusBadgeStyle(log.status)}`}>
                            {log.status.split('-').join(' ')}
                          </span>
                        </td>
                        <td className="px-container-padding py-4 text-on-surface-variant font-semibold">
                          {new Date(log.startTime).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="px-container-padding py-4 font-bold text-primary">
                          {log.status === 'completed' ? formatDuration(log.duration) : '--'}
                        </td>
                        <td className="px-container-padding py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedLeadId(log.leadId);
                              setCurrentPage('lead-detail');
                            }}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all cursor-pointer flex items-center justify-center ml-auto"
                            title="Open Recipient Conversation"
                          >
                            <span className="material-symbols-outlined text-[20px]">chat</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between px-container-padding py-4 bg-surface-container-low border-t border-surface-border">
              <span className="text-label-sm font-semibold text-on-surface-variant">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length} entries
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPageNum === 1}
                  onClick={() => setCurrentPageNum((prev) => prev - 1)}
                  className="p-1.5 border border-surface-border rounded hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }).map((_, pageIdx) => (
                  <button
                    key={pageIdx}
                    onClick={() => setCurrentPageNum(pageIdx + 1)}
                    className={`px-3 py-1.5 rounded text-label-md font-bold transition-all cursor-pointer ${
                      currentPageNum === pageIdx + 1
                        ? 'bg-primary text-on-primary'
                        : 'hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    {pageIdx + 1}
                  </button>
                ))}

                <button
                  disabled={currentPageNum === totalPages}
                  onClick={() => setCurrentPageNum((prev) => prev + 1)}
                  className="p-1.5 border border-surface-border rounded hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-on-surface-variant font-medium">
            No call log logs found.
          </div>
        )}
      </div>

    </div>
  );
};
export default CallLogsHistory;
