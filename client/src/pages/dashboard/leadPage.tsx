import React, { useEffect, useState, useRef } from 'react';
import { apiService } from '../../api';
import type { Lead, MessageLog, CallLog, Template } from '../../types';

interface LeadDetailProps {
  leadId: string;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const LeadDetailPage: React.FC<LeadDetailProps> = ({ leadId }) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat Input
  const [chatInput, setChatInput] = useState('');

  // Modals & Popups
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  
  // Call Simulator States
  const [callState, setCallState] = useState<'idle' | 'calling' | 'ringing' | 'connected' | 'completed'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef<number | null>(null);

  // Notes state
  const [notesText, setNotesText] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchLeadDetails = async () => {
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
    setLoading(true);
    fetchLeadDetails();

    // Listen for incoming simulator messages to refresh chat
    const handleIncomingMessage = (e: any) => {
      if (e.detail?.leadId === leadId) {
        fetchLeadDetails();
      }
    };
    window.addEventListener('ez_message_received', handleIncomingMessage);

    return () => {
      window.removeEventListener('ez_message_received', handleIncomingMessage);
      if (callTimerRef.current) window.clearInterval(callTimerRef.current);
    };
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

      // Simulate incoming Sandbox response after 4 seconds
      setTimeout(() => {
        apiService.simulateIncomingReply(lead._id, lead.mobileNumber);
      }, 4000);
    } catch (err) {
      console.error('Failed to send text message:', err);
    }
  };

  // Trigger Calling Simulator
  const handleInitiateCall = async () => {
    if (!lead || callState !== 'idle') return;

    setCallState('calling');
    setCallDuration(0);

    // Timeline: Calling (1.5s) -> Ringing (2s) -> Connected -> Timer -> Complete
    setTimeout(() => {
      setCallState('ringing');
      
      setTimeout(async () => {
        setCallState('connected');
        
        // Timer tick
        callTimerRef.current = window.setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);

        // Terminate call after 8 seconds of connected simulation
        setTimeout(async () => {
          if (callTimerRef.current) {
            window.clearInterval(callTimerRef.current);
            callTimerRef.current = null;
          }
          
          setCallState('completed');
          
          // Save call history entry
          try {
            await apiService.initiateCall(lead._id);
            fetchLeadDetails(); // Refresh call logs table
          } catch (err) {
            console.error('Call log update failed:', err);
          }

          // Return simulator back to idle
          setTimeout(() => {
            setCallState('idle');
          }, 2000);

        }, 8000);

      }, 2000);

    }, 1500);
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
        return 'bg-status-new text-white';
      case 'contacted':
        return 'bg-status-contacted text-white';
      case 'responded':
        return 'bg-status-responded text-white';
      case 'converted':
        return 'bg-status-converted text-white';
      case 'closed':
        return 'bg-status-closed text-white';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden animate-fade-in text-on-surface select-none">
      
      {/* LEFT COLUMN: Lead profile & details */}
      <section className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-surface-border bg-surface-container-lowest overflow-y-auto shrink-0 flex flex-col">
        <div className="p-container-padding text-center border-b border-surface-border">
          <div className="w-20 h-20 rounded-2xl bg-primary-container/20 text-primary border border-primary-container flex items-center justify-center mx-auto mb-4 font-bold text-headline-lg shadow-sm">
            {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <h3 className="font-headline-md text-headline-md font-bold text-text-primary dark:text-text-primary mb-1">
            {lead.name}
          </h3>
          <span className={`px-3 py-1 rounded-full text-label-sm font-bold uppercase ${getStatusColorClass(lead.status)}`}>
            {lead.status}
          </span>
        </div>

        <div className="p-container-padding space-y-6 flex-1">
          {/* Contact Details */}
          <div>
            <label className="text-label-md font-label-md text-on-surface-variant block uppercase tracking-wider mb-2 font-bold">
              Contact Details
            </label>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[20px]">phone</span>
                <span className="text-body-md font-semibold">{lead.mobileNumber}</span>
              </div>
              {lead.email && (
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="material-symbols-outlined text-primary text-[20px]">mail</span>
                  <span className="text-body-md font-semibold truncate hover:underline cursor-pointer" title={lead.email}>
                    {lead.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Business Type */}
          <div>
            <label className="text-label-md font-label-md text-on-surface-variant block uppercase tracking-wider mb-2 font-bold">
              Business Segment
            </label>
            <div className="bg-surface-container-low border border-surface-border p-3 rounded-lg flex items-center gap-2.5">
              <span className="material-symbols-outlined text-secondary">corporate_fare</span>
              <span className="text-body-md font-bold capitalize">
                {lead.businessType.split('_').join(' ')}
              </span>
            </div>
          </div>

          {/* Lead Score Indicator */}
          <div>
            <label className="text-label-md font-label-md text-on-surface-variant block uppercase tracking-wider mb-2 font-bold">
              Engagement Lead Score
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-surface-container-low h-2.5 border border-surface-border rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary-container h-full w-[70%] rounded-full" />
              </div>
              <span className="text-body-md font-bold text-primary">70/100</span>
            </div>
          </div>

          {/* Notes Area */}
          <div className="flex flex-col">
            <label className="text-label-md font-label-md text-on-surface-variant block uppercase tracking-wider mb-2 font-bold">
              Admin Notes
            </label>
            <textarea
              rows={4}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-border rounded-lg p-3 text-body-md outline-none focus:ring-1 focus:ring-primary text-on-surface resize-none transition-all placeholder:text-on-surface-variant/30"
              placeholder="Add details discussed during the call..."
            />
            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="mt-2 text-label-sm font-bold bg-primary text-on-primary py-1.5 px-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-2xs self-end cursor-pointer disabled:opacity-50"
            >
              {isSavingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>

        {/* Footer info metadata */}
        <div className="p-container-padding bg-surface-container-low border-t border-surface-border text-label-sm text-on-surface-variant flex justify-between">
          <span>Created: {new Date(lead.createdAt).toLocaleDateString()}</span>
          <span>ID: {lead._id}</span>
        </div>
      </section>

      {/* CENTER COLUMN: WhatsApp Live Chat UI */}
      <section className="flex-1 flex flex-col bg-surface-container-lowest border-r border-surface-border relative h-[60%] lg:h-full">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface-container-low/30">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-converted animate-pulse" />
            <span className="font-headline-md text-headline-md font-bold text-text-primary">WhatsApp conversation thread</span>
          </div>
          <div className="flex gap-2">
            <button className="p-1.5 rounded-full hover:bg-surface-container-low text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
            <button className="p-1.5 rounded-full hover:bg-surface-container-low text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
        </div>

        {/* Chat bubbles thread area */}
        <div className="flex-1 overflow-y-auto p-container-padding space-y-4 chat-scroll bg-surface-container-low/20">
          {messages.length > 0 ? (
            messages.map((msg) => {
              const isInbound = msg.direction === 'inbound';
              return (
                <div
                  key={msg._id}
                  className={`flex gap-3 max-w-[80%] animate-fade-in ${isInbound ? '' : 'flex-row-reverse ml-auto'}`}
                >
                  {isInbound ? (
                    <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container flex-shrink-0 mt-1 flex items-center justify-center font-bold text-label-sm text-primary">
                      {getInitials(lead.name)}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-container border border-surface-border flex-shrink-0 mt-1 flex items-center justify-center font-bold text-label-sm text-on-surface-variant">
                      A
                    </div>
                  )}

                  <div className={isInbound ? 'text-left' : 'text-right'}>
                    <div
                      className={`p-3.5 rounded-2xl shadow-2xs font-body-md text-body-md ${
                        isInbound
                          ? 'bg-surface-container-lowest border border-surface-border text-on-surface rounded-tl-xs'
                          : 'bg-primary text-on-primary rounded-tr-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                    </div>
                    
                    <div className={`flex items-center gap-1 mt-1 text-label-sm text-on-surface-variant ${isInbound ? '' : 'justify-end'}`}>
                      <span>
                        {new Date(msg.sentAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {!isInbound && (
                        <span className="material-symbols-outlined text-primary text-[14px] font-bold">
                          done_all
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center text-on-surface-variant font-medium py-12">
              No conversations logged. Use quick actions to send an onboarding template.
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form Box */}
        <div className="p-4 border-t border-surface-border bg-surface-container-lowest">
          <div className="flex items-center gap-3 bg-surface-container-low rounded-2xl p-2 border border-surface-border focus-within:border-primary transition-all">
            <button className="p-2 text-on-surface-variant hover:text-primary flex items-center justify-center" title="Attach Files">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </button>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              className="flex-1 bg-transparent border-none focus:ring-0 text-body-md py-2 outline-none text-on-surface"
              placeholder="Type a message..."
            />
            <button className="p-2 text-on-surface-variant hover:text-primary flex items-center justify-center" title="Emoji">
              <span className="material-symbols-outlined text-[20px]">mood</span>
            </button>
            <button
              onClick={handleSendText}
              disabled={!chatInput.trim()}
              className="bg-primary text-on-primary p-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      </section>

      {/* RIGHT COLUMN: Voice dialing & Call log list */}
      <aside className="w-full lg:w-80 border-t lg:border-t-0 border-surface-border bg-surface-container-lowest flex flex-col shrink-0">
        {/* Actions panel */}
        <div className="p-container-padding border-b border-surface-border">
          <label className="text-label-md font-label-md text-on-surface-variant block uppercase tracking-wider mb-4 font-bold">
            Engagement Controls
          </label>
          <div className="space-y-3">
            <button
              onClick={handleOpenTemplateModal}
              className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3 px-4 rounded-xl font-bold hover:opacity-95 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
              Send Template
            </button>
            <button
              onClick={handleInitiateCall}
              disabled={callState !== 'idle'}
              className="w-full flex items-center justify-center gap-2 border border-surface-border text-on-surface py-3 px-4 rounded-xl font-bold hover:bg-surface-container-low transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
              Call Lead
            </button>
          </div>
        </div>

        {/* Live Call Simulator Panel */}
        {callState !== 'idle' && (
          <div className="m-4 p-4 border border-surface-border bg-surface-container-low rounded-2xl flex flex-col items-center justify-center text-center animate-fade-in shadow-2xs relative">
            <span className="absolute top-2 right-2 text-[10px] uppercase font-bold tracking-wider text-primary">
              Twilio SDK Voice
            </span>

            {/* Pulse Calling State indicators */}
            <div className="relative flex items-center justify-center w-14 h-14 mb-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary/20 opacity-75 animate-ping" />
              <div className="relative rounded-full bg-primary text-white p-3 flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[24px]">
                  {callState === 'completed' ? 'phone_disabled' : 'call'}
                </span>
              </div>
            </div>

            <h4 className="font-body-md font-bold text-text-primary capitalize">
              {callState === 'calling' && 'Dialing lead...'}
              {callState === 'ringing' && 'Ringing...'}
              {callState === 'connected' && 'In Progress'}
              {callState === 'completed' && 'Call Finished'}
            </h4>
            <p className="text-label-sm text-on-surface-variant mt-0.5">{lead.mobileNumber}</p>
            
            {callState === 'connected' && (
              <p className="text-headline-md font-bold text-primary font-mono mt-2 animate-pulse">
                {formatCallDuration(callDuration)}
              </p>
            )}
          </div>
        )}

        {/* Call Logs Specific to the lead */}
        <div className="flex-1 overflow-y-auto p-container-padding">
          <label className="text-label-md font-label-md text-on-surface-variant block uppercase tracking-wider mb-4 font-bold">
            Recent Voice Calls
          </label>
          <div className="space-y-4">
            {calls.length > 0 ? (
              calls.map((c) => (
                <div key={c._id} className="p-3.5 border border-surface-border rounded-xl hover:bg-surface-container-low transition-colors duration-150 relative bg-surface-container-low/10 shadow-2xs">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        c.status === 'completed'
                          ? 'bg-status-converted/15 text-status-converted border-status-converted/25'
                          : 'bg-error-container/20 text-error border-error-container'
                      }`}
                    >
                      {c.status}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      {new Date(c.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-body-md font-bold text-text-primary capitalize">
                    {c.status === 'completed' ? 'Outgoing Connection' : 'No Answer'}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5 text-primary">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span className="text-label-sm font-bold">
                      {c.duration ? formatCallDuration(c.duration) : '0m 00s'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-on-surface-variant font-medium py-8 border border-dashed border-surface-border rounded-xl">
                No voice logs recorded.
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* WhatsApp Template Modal Drawer */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-container-lowest border border-surface-border w-[520px] max-w-full rounded-2xl shadow-xl overflow-hidden animate-zoom-in text-on-surface">
            
            <div className="px-6 py-4 border-b border-surface-border flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-text-primary">
                  Select WhatsApp Template
                </h3>
                <p className="text-label-sm text-on-surface-variant font-semibold">
                  Filtered by Business Segment: <span className="capitalize">{lead.businessType.split('_').join(' ')}</span>
                </p>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1.5 hover:bg-surface-container rounded-full text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {templates.length > 0 ? (
                <>
                  {/* Select Dropdown */}
                  <div>
                    <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2 font-bold">
                      Select Template Name
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTemplate?._id}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        className="w-full appearance-none bg-surface-container-low border border-surface-border rounded-lg pl-4 pr-10 py-2.5 text-body-md text-on-surface focus:ring-2 focus:ring-primary-container outline-none cursor-pointer"
                      >
                        {templates.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Body Preview */}
                  {selectedTemplate && (
                    <div className="space-y-4">
                      <div className="bg-surface-container-low border border-surface-border p-4 rounded-xl">
                        <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-2 font-bold">
                          Template Body Preview
                        </label>
                        <p className="font-body-md text-on-surface italic leading-relaxed whitespace-pre-wrap">
                          "{selectedTemplate.sampleBody}"
                        </p>
                      </div>

                      {/* Variable inputs */}
                      {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                        <div className="space-y-3">
                          <label className="block text-label-md font-label-md text-on-surface uppercase tracking-wider font-bold">
                            Fill Template Variables
                          </label>
                          {selectedTemplate.variables.map((variable, idx) => (
                            <div key={variable} className="flex flex-col gap-1.5">
                              <span className="text-label-sm font-semibold capitalize text-on-surface-variant">
                                Variable {idx + 1} ({variable})
                              </span>
                              <input
                                type="text"
                                value={templateVariables[variable] || ''}
                                onChange={(e) =>
                                  setTemplateVariables((prev) => ({ ...prev, [variable]: e.target.value }))
                                }
                                className="w-full bg-surface-container-low border border-surface-border rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-primary-container outline-none text-on-surface"
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
                <div className="p-8 text-center text-on-surface-variant font-medium">
                  No active templates found for business type: {lead.businessType}. Go to Settings or Templates to configure.
                </div>
              )}
            </div>

            {/* Modal actions */}
            <div className="px-6 py-4 bg-surface-container-low border-t border-surface-border flex justify-end gap-3">
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-5 py-2 border border-surface-border rounded-lg font-bold text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTemplate}
                disabled={!selectedTemplate}
                className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default LeadDetailPage;
