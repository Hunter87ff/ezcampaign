import React, { useEffect, useState, useRef } from 'react';
import { apiService } from '../../api';
import type { Lead, MessageLog, CallLog, Template, Page } from '../../types';

interface LeadDetailProps {
  leadId: string;
  setCurrentPage: (page: Page) => void;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const LeadDetailPage: React.FC<LeadDetailProps> = ({ leadId, setCurrentPage }) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat Input
  const [chatInput, setChatInput] = useState('');

  // UI States
  const [showProfile, setShowProfile] = useState(true);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);

  // Modals & Popups
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

  const [isCalling, setIsCalling] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callMessage, setCallMessage] = useState('');
  const [activeCall, setActiveCall] = useState<CallLog | null>(null);
  const [callStatus, setCallStatus] = useState<string>('initiated');

  // Notes state
  const [notesText, setNotesText] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchLeadDetails = async () => {
    setLoading(true);
    try {
      const allLeads = await apiService.getLeads();
      const currentLead = allLeads.find((l) => l._id === leadId);
      if (currentLead) {
        setLead(currentLead);
        setNotesText(currentLead.notes || '');

        // Fetch message logs
        const msgs = await apiService.getMessages(leadId);
        setMessages(msgs);

        // Fetch call logs
        const callLogs = await apiService.getCallLogs(leadId);
        setCalls(callLogs);

        // Fetch templates matching lead's business type
        const matches = await apiService.getTemplates(currentLead.businessType);
        setTemplates(matches);
      }
    } catch (err) {
      console.error('Failed to load lead details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLeadDetails();

    // Listen for incoming simulator messages to refresh chat
    const handleIncomingMessage = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.leadId === leadId) {
        fetchLeadDetails();
      }
    };
    window.addEventListener('ez_message_received', handleIncomingMessage);

    return () => {
      window.removeEventListener('ez_message_received', handleIncomingMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  // Scroll to bottom when messages load/add
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Note Save
  const handleSaveNotes = async () => {
    if (!lead) return;
    setIsSavingNotes(true);
    try {
      const updated = await apiService.saveLead({ ...lead, notes: notesText });
      setLead(updated);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Send Direct Message (Outbound Free Text)
  const handleSendText = async () => {
    if (!chatInput.trim() || !lead) return;
    const textToSend = chatInput.trim();
    setChatInput('');

    try {
      const sentMsg = await apiService.sendMessage(lead._id, undefined, undefined, textToSend);
      setMessages((prev) => [...prev, sentMsg]);

      // Update Lead status to contacted if new
      if (lead.status === 'new') {
        const updated = await apiService.saveLead({ ...lead, status: 'contacted' });
        setLead(updated);
      }

    } catch (err) {
      console.error('Failed to send text message:', err);
    }
  };

  // Poll active call status from the server
  const startCallPolling = (callId: string) => {
    const intervalId = setInterval(async () => {
      try {
        const callLogs = await apiService.getCallLogs(leadId);
        const currentCall = callLogs.find((c) => c._id === callId);
        if (currentCall) {
          setCallStatus(currentCall.status);
          if (['completed', 'failed', 'busy', 'no-answer', 'canceled'].includes(currentCall.status)) {
            clearInterval(intervalId);
            // Wait 2.5 seconds to show the final status, then close overlay
            setTimeout(() => {
              setActiveCall(null);
              setIsCalling(false);
              fetchLeadDetails(); // Refresh logs to update sidebar
            }, 2500);
          }
        }
      } catch (err) {
        console.error('Error polling call status:', err);
        clearInterval(intervalId);
        setIsCalling(false);
        setActiveCall(null);
      }
    }, 2000);
  };

  // Open the Message Input Modal before starting the call
  const handleOpenCallModal = () => {
    if (!lead) return;
    setCallMessage(`Hello ${lead.name}, this is an automated message from EZ Campaign to check on your recent inquiry.`);
    setIsCallModalOpen(true);
  };

  // Trigger outbound call via server API with custom message text
  const handleInitiateCall = async () => {
    if (!lead || !callMessage.trim()) return;
    setIsCallModalOpen(false);
    setIsCalling(true);
    setCallStatus('initiated');
    
    try {
      const log = await apiService.initiateCall(lead._id, callMessage.trim());
      setActiveCall(log);
      setCallStatus(log.status || 'initiated');
      startCallPolling(log._id);
    } catch (err) {
      console.error('Failed to initiate voice call:', err);
      setIsCalling(false);
    }
  };

  // Open Template Modal Selection
  const handleOpenTemplateModal = () => {
    if (templates.length > 0) {
      setSelectedTemplate(templates[0]);
      // Initialize variables
      const vars: Record<string, string> = {};
      if (templates[0].variables) {
        templates[0].variables.forEach((v) => {
          vars[v] = v === 'name' ? lead?.name || '' : '';
        });
      }
      setTemplateVariables(vars);
    }
    setIsTemplateModalOpen(true);
  };

  const handleTemplateChange = (templateId: string) => {
    const found = templates.find((t) => t._id === templateId);
    if (found) {
      setSelectedTemplate(found);
      const vars: Record<string, string> = {};
      if (found.variables) {
        found.variables.forEach((v) => {
          vars[v] = v === 'name' ? lead?.name || '' : '';
        });
      }
      setTemplateVariables(vars);
    }
  };

  const handleSendTemplate = async () => {
    if (!lead || !selectedTemplate) return;

    try {
      await apiService.sendMessage(lead._id, selectedTemplate._id, templateVariables);
      setIsTemplateModalOpen(false);
      fetchLeadDetails();
    } catch (err) {
      console.error('Failed to send template message:', err);
    }
  };

  if (loading || !lead) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-body-md text-on-surface-variant font-medium">Opening lead secure thread...</span>
        </div>
      </div>
    );
  }

  const formatCallDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem < 10 ? '0' : ''}${rem}s`;
  };

  const getStatusColorClass = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50';
      case 'contacted':
        return 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/50';
      case 'responded':
        return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
      case 'converted':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
      case 'closed':
        return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/50';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden animate-fade-in text-on-surface select-none">

      {/* LEFT COLUMN: WhatsApp Live Chat UI */}
      <section className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 relative h-full">

        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-805 flex items-center justify-between bg-white dark:bg-slate-900/80 backdrop-blur-xs">
          <div className="flex items-center gap-3 select-none">
            {/* Back Arrow button */}
            <button
              onClick={() => setCurrentPage('leads')}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer mr-1"
              title="Back to Contacts"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>

            {/* Avatar and Name clickable to toggle profile */}
            <div
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shadow-3xs border border-slate-205/50 dark:border-slate-700/50 group-hover:scale-105 transition-all">
                {getInitials(lead.name)}
              </div>
              <div className="text-left">
                <h3 className="font-sans font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight">
                  {lead.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold capitalize">
                    {lead.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Outbound call button */}
            <button
              onClick={handleOpenCallModal}
              disabled={isCalling}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
              title={isCalling ? "Initiating Call..." : "Call Lead"}
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
            </button>
            {/* Toggle right sidebar details */}
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`p-1.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${showProfile
                  ? 'bg-primary/10 text-primary dark:bg-emerald-500/10 dark:text-emerald-400 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              title="Toggle Profile Details"
            >
              <span className="material-symbols-outlined text-[20px]">info</span>
            </button>
          </div>
        </div>



        {/* Chat bubbles thread area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 chat-scroll bg-slate-50 dark:bg-slate-950/60">
          {messages.length > 0 ? (
            messages.map((msg) => {
              const isInbound = msg.direction === 'inbound';
              return (
                <div
                  key={msg._id}
                  className={`flex gap-3 max-w-[80%] animate-fade-in ${isInbound ? '' : 'flex-row-reverse ml-auto'}`}
                >
                  {isInbound ? (
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/25 dark:border-emerald-555 flex-shrink-0 mt-1 flex items-center justify-center font-bold text-xs text-primary dark:text-emerald-400 shadow-3xs">
                      {getInitials(lead.name)}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex-shrink-0 mt-1 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-400 shadow-3xs">
                      A
                    </div>
                  )}

                  <div className={isInbound ? 'text-left' : 'text-right'}>
                    <div
                      className={`p-3.5 rounded-2xl shadow-3xs font-sans text-xs ${isInbound
                          ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                          : 'bg-primary dark:bg-emerald-600 text-white rounded-tr-xs'
                        }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                    </div>

                    <div className={`flex items-center gap-1 mt-1 text-[10px] text-slate-450 dark:text-slate-500 ${isInbound ? '' : 'justify-end'}`}>
                      <span>
                        {new Date(msg.sentAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {!isInbound && (
                        <span className="material-symbols-outlined text-primary dark:text-emerald-400 text-[12px] font-bold">
                          done_all
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center text-slate-450 dark:text-slate-500 font-semibold py-12 text-xs">
              No conversations logged. Use quick actions (+) to send an onboarding template.
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form Box */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-805 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-1.5 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">

            {/* Quick action dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPlusMenuOpen(!plusMenuOpen)}
                className={`p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${plusMenuOpen
                    ? 'bg-slate-200 dark:bg-slate-700 text-primary dark:text-emerald-450'
                    : 'text-slate-450 hover:text-primary dark:text-slate-450 dark:hover:text-emerald-450'
                  }`}
                title="Quick Actions"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
              </button>

              {plusMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setPlusMenuOpen(false)} />
                  <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-xl shadow-lg py-1 w-48 z-40 animate-zoom-in text-left border-slate-200/85">
                    <button
                      type="button"
                      onClick={() => {
                        setPlusMenuOpen(false);
                        handleOpenTemplateModal();
                      }}
                      className="w-full px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-750 dark:text-slate-200 font-sans text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-slate-450 dark:text-slate-400">chat_bubble</span>
                      Send Template
                    </button>
                  </div>
                </>
              )}
            </div>

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              className="flex-1 bg-transparent border-none focus:ring-0 text-xs py-2 outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              placeholder="Type a message..."
            />

            <button
              onClick={handleSendText}
              disabled={!chatInput.trim()}
              className="bg-primary dark:bg-emerald-600 text-white p-2 rounded-lg hover:opacity-95 transition-opacity flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Send Message"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>
        </div>
      </section>

      {/* RIGHT COLUMN: Lead profile & details, collapsible */}
      {showProfile && (
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 overflow-y-auto h-[45%] lg:h-full select-none divide-y divide-slate-100 dark:divide-slate-800/80">

          {/* Avatar and Main Info header */}
          <div className="p-5 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary dark:bg-emerald-500/10 dark:text-emerald-400 border border-primary/20 dark:border-emerald-500/20 flex items-center justify-center font-bold text-2xl shadow-3xs mb-3">
              {getInitials(lead.name)}
            </div>
            <h3 className="font-sans font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
              {lead.name}
            </h3>
            <span className={`px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase mt-1.5 tracking-wider ${getStatusColorClass(lead.status)}`}>
              {lead.status}
            </span>
          </div>

          {/* Details Section */}
          <div className="p-4 space-y-3.5 text-left">
            <div>
              <label className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                Contact Details
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="material-symbols-outlined text-primary dark:text-emerald-400 text-[18px]">phone</span>
                  <span className="font-mono text-xs font-semibold">{lead.mobileNumber}</span>
                </div>
                {lead.email && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 overflow-hidden">
                    <span className="material-symbols-outlined text-primary dark:text-emerald-400 text-[18px]">mail</span>
                    <span className="text-xs font-semibold truncate" title={lead.email}>
                      {lead.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                Business Segment
              </label>
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-2 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary dark:text-emerald-400 text-[18px]">corporate_fare</span>
                <span className="text-xs font-bold capitalize text-slate-700 dark:text-slate-305">
                  {lead.businessType.split('_').join(' ')}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                Engagement Lead Score
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 border border-slate-200 dark:border-slate-700 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-primary-container dark:from-emerald-500 dark:to-emerald-450 h-full w-[70%] rounded-full" />
                </div>
                <span className="text-xs font-bold text-primary dark:text-emerald-400 font-mono">70/100</span>
              </div>
            </div>
          </div>

          {/* Notes Area */}
          <div className="p-4 flex flex-col text-left">
            <label className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Admin Notes
            </label>
            <textarea
              rows={4}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 dark:text-slate-100 font-medium resize-none transition-all placeholder:text-slate-400"
              placeholder="Add details discussed during call..."
            />
            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="mt-2 text-[10px] font-bold bg-primary dark:bg-emerald-650 text-white py-1.5 px-3 rounded-lg hover:opacity-95 transition-all flex items-center justify-center gap-1.5 self-end cursor-pointer disabled:opacity-50"
            >
              {isSavingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>

          {/* Call Logs Specific to the lead */}
          <div className="flex-1 overflow-y-auto p-4 text-left">
            <label className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 block">
              Recent Voice Calls
            </label>
            <div className="space-y-3">
              {calls.length > 0 ? (
                calls.map((c) => (
                  <div key={c._id} className="p-3 border border-slate-200 dark:border-slate-805 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 shadow-3xs flex flex-col">
                    <div className="flex justify-between items-start mb-1.5">
                      <span
                        className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded border ${c.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'
                            : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-450 dark:border-rose-900/50'
                          }`}
                      >
                        {c.status}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                        {new Date(c.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {c.status === 'completed' ? 'Outgoing Connection' : 'No Answer'}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-primary dark:text-emerald-450">
                      <span className="material-symbols-outlined text-[13px]">schedule</span>
                      <span className="text-[9px] font-bold">
                        {c.duration ? formatCallDuration(c.duration) : '0m 00s'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No voice logs recorded.
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* WhatsApp Template Modal Drawer */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-[520px] max-w-full rounded-2xl shadow-xl overflow-hidden animate-zoom-in text-slate-800 dark:text-slate-100">

            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-950 dark:text-white text-left">
                  Select WhatsApp Template
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-left mt-0.5">
                  Segment: <span className="capitalize">{lead.businessType.split('_').join(' ')}</span>
                </p>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5 text-left">
              {templates.length > 0 ? (
                <>
                  {/* Select Dropdown */}
                  <div>
                    <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                      Select Template Name
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTemplate?._id}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-10 py-2.5 text-xs text-slate-705 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer font-semibold"
                      >
                        {templates.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Body Preview */}
                  {selectedTemplate && (
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
                        <label className="block text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Template Body Preview
                        </label>
                        <p className="font-sans text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed whitespace-pre-wrap">
                          "{selectedTemplate.sampleBody}"
                        </p>
                      </div>

                      {/* Variable inputs */}
                      {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                        <div className="space-y-3">
                          <label className="block text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Fill Template Variables
                          </label>
                          {selectedTemplate.variables.map((variable, idx) => (
                            <div key={variable} className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold capitalize text-slate-500 dark:text-slate-400">
                                Variable {idx + 1} ({variable})
                              </span>
                              <input
                                type="text"
                                value={templateVariables[variable] || ''}
                                onChange={(e) =>
                                  setTemplateVariables((prev) => ({ ...prev, [variable]: e.target.value }))
                                }
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none text-slate-800 dark:text-slate-100 font-sans font-medium"
                                placeholder={`Enter value for ${variable}`}
                                required
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-bold text-xs">
                  No active templates found for business type: {lead.businessType}. Go to Settings or Templates to configure.
                </div>
              )}
            </div>

            {/* Modal actions */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTemplate}
                disabled={!selectedTemplate}
                className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Message Input Modal */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-[500px] max-w-full rounded-2xl shadow-xl overflow-hidden animate-zoom-in text-slate-800 dark:text-slate-100">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-805 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-955 dark:text-white text-left">
                  Initiate WhatsApp Call
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-left mt-0.5">
                  To: {lead.name} ({lead.mobileNumber})
                </p>
              </div>
              <button
                onClick={() => setIsCallModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] font-sans font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                  Message to say on Call (Text-to-Speech)
                </label>
                <textarea
                  rows={4}
                  value={callMessage}
                  onChange={(e) => setCallMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 text-slate-850 dark:text-slate-100 font-sans font-medium resize-none transition-all placeholder:text-slate-400"
                  placeholder="Type the exact message the automated system will read to the lead..."
                  required
                />
                <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal mt-1">
                  When the contact answers, Twilio Voice will read this message using natural Text-to-Speech synthesis and hang up.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setIsCallModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiateCall}
                disabled={!callMessage.trim()}
                className="px-5 py-2 bg-primary dark:bg-emerald-600 text-white text-xs font-bold rounded-lg hover:opacity-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                Start Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calling Screen / Status Overlay */}
      {activeCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-[380px] rounded-2xl shadow-2xl p-8 text-center animate-zoom-in text-slate-850 dark:text-slate-100">
            {/* Pulsating calling circle */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 dark:bg-emerald-500/20 animate-ping" />
                <div className="w-20 h-20 rounded-full bg-primary/10 text-primary dark:bg-emerald-500/10 dark:text-emerald-400 border border-primary/20 dark:border-emerald-500/20 flex items-center justify-center shadow-md relative z-10">
                  <span className="material-symbols-outlined text-[40px] animate-pulse">call</span>
                </div>
              </div>
            </div>

            <h3 className="font-sans font-extrabold text-base text-slate-900 dark:text-white mb-1">
              Calling {lead.name}
            </h3>
            <p className="text-xs font-mono text-slate-450 dark:text-slate-500 mb-6">
              {lead.mobileNumber}
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4 rounded-xl mb-6 flex flex-col items-center gap-1">
              <span className="text-[10px] text-slate-400 dark:text-slate-505 uppercase tracking-wider font-bold">
                Connection Status
              </span>
              <span className={`text-xs font-bold capitalize px-2.5 py-0.5 rounded-full border ${
                callStatus === 'in-progress' || callStatus === 'completed'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'
                  : ['failed', 'busy', 'no-answer', 'canceled'].includes(callStatus)
                    ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-450 dark:border-rose-900/50 animate-shake'
                    : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50'
              }`}>
                {callStatus}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium px-4 mb-4 line-clamp-3 text-center">
              Saying: "{callMessage}"
            </div>

            {/* Call logging status indicator */}
            {['completed', 'failed', 'busy', 'no-answer', 'canceled'].includes(callStatus) && (
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 mb-2 animate-fade-in">
                <svg className="animate-spin h-3.5 w-3.5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Closing and updating call log...
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
export default LeadDetailPage;
