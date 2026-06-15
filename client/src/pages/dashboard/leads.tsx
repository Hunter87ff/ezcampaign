import React, { useEffect, useState } from 'react';
import { apiService } from '../../api';
import type { Lead, BusinessType, LeadStatus } from '../../types';
import { ConfirmDialog } from '../../components/confirmDialog';

interface LeadsProps {
  searchQuery: string;
  setSelectedLeadId: (id: string | null) => void;
  setCurrentPage: (page: 'dashboard' | 'leads' | 'lead-detail' | 'templates' | 'call-logs' | 'settings') => void;
}

export const LeadsList: React.FC<LeadsProps> = ({
  searchQuery,
  setSelectedLeadId,
  setCurrentPage,
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedBusinessType, setSelectedBusinessType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Pagination States
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 6; // Adjusted to fit grid layouts nicely

  // Context Menu States
  const [activeMenuLeadId, setActiveMenuLeadId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<'button' | 'cursor'>('button');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingLead, setEditingLead] = useState<Partial<Lead> | null>(null);

  // Confirm Dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<{ id: string; name: string } | null>(null);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formBusinessType, setFormBusinessType] = useState<BusinessType>('real_estate');
  const [formStatus, setFormStatus] = useState<LeadStatus>('new');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await apiService.getLeads({
        search: searchQuery,
        businessType: selectedBusinessType,
        status: selectedStatus,
      });
      setLeads(data);
      setCurrentPageNum(1); // Reset page on filter/search change
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Synchronous effect fetch with suppression
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedBusinessType, selectedStatus]);

  // Click outside to close context menu
  useEffect(() => {
    const handleDismissMenu = () => {
      setActiveMenuLeadId(null);
    };
    window.addEventListener('click', handleDismissMenu);
    window.addEventListener('contextmenu', handleDismissMenu);
    return () => {
      window.removeEventListener('click', handleDismissMenu);
      window.removeEventListener('contextmenu', handleDismissMenu);
    };
  }, []);

  // Open Modal Helpers
  const openCreateModal = () => {
    setModalMode('create');
    setEditingLead(null);
    setFormName('');
    setFormMobile('+91');
    setFormEmail('');
    setFormBusinessType('real_estate');
    setFormStatus('new');
    setFormNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setModalMode('edit');
    setEditingLead(lead);
    setFormName(lead.name);
    setFormMobile(lead.mobileNumber);
    setFormEmail(lead.email || '');
    setFormBusinessType(lead.businessType);
    setFormStatus(lead.status);
    setFormNotes(lead.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Submit Lead Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formMobile.trim()) {
      setFormError('Name and Mobile Number are required.');
      return;
    }

    // Basic mobile validation
    const mobileRegex = /^\+[1-9]\d{1,14}$/;
    if (!mobileRegex.test(formMobile.replace(/\s+/g, ''))) {
      setFormError('Please enter a valid mobile number with country code (e.g. +919876543210).');
      return;
    }

    try {
      const payload: Partial<Lead> = {
        name: formName.trim(),
        mobileNumber: formMobile.trim().replace(/\s+/g, ''),
        email: formEmail.trim() || undefined,
        businessType: formBusinessType,
        status: formStatus,
        notes: formNotes.trim() || undefined,
      };

      if (modalMode === 'edit' && editingLead) {
        payload._id = editingLead._id;
      }

      await apiService.saveLead(payload);
      setIsModalOpen(false);
      fetchLeads();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save lead.');
    }
  };

  // Soft Delete Action
  const handleDeleteLead = (id: string, name: string) => {
    setLeadToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (leadToDelete) {
      try {
        await apiService.deleteLead(leadToDelete.id);
        fetchLeads();
      } catch (err) {
        console.error('Failed to delete lead:', err);
      } finally {
        setDeleteConfirmOpen(false);
        setLeadToDelete(null);
      }
    }
  };

  // Clear Filters
  const handleClearFilters = () => {
    setSelectedBusinessType('all');
    setSelectedStatus('all');
  };

  // Context Menu Action dispatcher
  const handleMenuAction = (action: 'view' | 'edit' | 'delete', leadId: string) => {
    setActiveMenuLeadId(null);
    const targetLead = leads.find((l) => l._id === leadId);
    if (!targetLead) return;

    if (action === 'view') {
      setSelectedLeadId(targetLead._id);
      setCurrentPage('lead-detail');
    } else if (action === 'edit') {
      openEditModal(targetLead);
    } else if (action === 'delete') {
      handleDeleteLead(targetLead._id, targetLead.name);
    }
  };

  // Three-dot button handler
  const handleThreeDotClick = (e: React.MouseEvent, leadId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (activeMenuLeadId === leadId && menuAnchor === 'button') {
      setActiveMenuLeadId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    // Dropdown aligned slightly left and below the button
    setMenuPosition({
      x: rect.right - 176,
      y: rect.bottom + window.scrollY + 6,
    });
    setMenuAnchor('button');
    setActiveMenuLeadId(leadId);
  };

  // Right-click context handler
  const handleRowContextMenu = (e: React.MouseEvent, leadId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPosition({
      x: e.clientX,
      y: e.clientY + window.scrollY,
    });
    setMenuAnchor('cursor');
    setActiveMenuLeadId(leadId);
  };

  // Paginated Leads Calculations
  const indexOfLastItem = currentPageNum * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeads = leads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leads.length / itemsPerPage);

  const getStatusBadgeStyle = (status: LeadStatus) => {
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
        return 'bg-slate-50 text-slate-650 border-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/50';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatBusinessTypeLabel = (type: BusinessType) => {
    return type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatLeadDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 max-w-[1440px] mx-auto animate-fade-in select-none">
      
      {/* Title & Add Contact Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div className="text-left">
          <h2 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
            Contacts Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Monitor, edit, and engage with your WhatsApp business leads.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary text-white px-5 py-2.5 rounded-lg font-sans text-xs font-bold flex items-center gap-2 hover:opacity-95 transition-all cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Contact
        </button>
      </div>

      {/* Modern Filters Panel */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs select-none">
        <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Filter by:
        </span>
        
        {/* Business Type Selector */}
        <div className="relative">
          <select
            value={selectedBusinessType}
            onChange={(e) => setSelectedBusinessType(e.target.value)}
            className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 font-sans text-xs font-semibold text-slate-700 dark:text-slate-350 focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="all">All Business Types</option>
            <option value="real_estate">Real Estate</option>
            <option value="healthcare">Healthcare</option>
            <option value="education">Education</option>
            <option value="ecommerce">E-commerce</option>
            <option value="finance">Finance</option>
            <option value="restaurant">Restaurant</option>
            <option value="travel">Travel</option>
            <option value="other">Other</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[16px]">
            expand_more
          </span>
        </div>

        {/* Status Selector */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 font-sans text-xs font-semibold text-slate-700 dark:text-slate-350 focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="responded">Responded</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[16px]">
            expand_more
          </span>
        </div>

        {/* Reset Filters Trigger */}
        {(selectedBusinessType !== 'all' || selectedStatus !== 'all') && (
          <button
            onClick={handleClearFilters}
            className="ml-auto text-xs font-bold text-primary dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">filter_list_off</span>
            Clear Filters
          </button>
        )}
      </div>

      {/* Main content display */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-550 flex flex-col items-center justify-center gap-3">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="font-sans font-bold text-xs text-slate-500">Querying contacts directory...</span>
        </div>
      ) : leads.length > 0 ? (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 select-none">
                  <th className="px-4 py-2.5 text-[9px] font-sans font-bold uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2.5 text-[9px] font-sans font-bold uppercase tracking-wider">Mobile Number</th>
                  <th className="px-4 py-2.5 text-[9px] font-sans font-bold uppercase tracking-wider">Business Type</th>
                  <th className="px-4 py-2.5 text-[9px] font-sans font-bold uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2.5 text-[9px] font-sans font-bold uppercase tracking-wider">Last Activity</th>
                  <th className="px-4 py-2.5 text-[9px] font-sans font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-250">
                {currentLeads.map((lead, idx) => {
                  const bgColors = [
                    'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                    'bg-violet-500/10 text-violet-600 dark:text-violet-400',
                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                  ];
                  const colorClass = bgColors[idx % bgColors.length];

                  return (
                    <tr
                      key={lead._id}
                      onContextMenu={(e) => handleRowContextMenu(e, lead._id)}
                      className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150 group cursor-pointer"
                      onClick={() => {
                        setSelectedLeadId(lead._id);
                        setCurrentPage('lead-detail');
                      }}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full ${colorClass} flex items-center justify-center font-bold text-[10px] shadow-3xs`}>
                            {getInitials(lead.name)}
                          </div>
                          <span className="font-sans font-bold text-xs text-slate-900 dark:text-white group-hover:text-primary transition-colors">{lead.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {lead.mobileNumber}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100/70 dark:bg-slate-800/80 text-slate-500 dark:text-slate-450 border border-slate-200/40 dark:border-slate-700/50 text-[9px] font-bold">
                          {formatBusinessTypeLabel(lead.businessType)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${getStatusBadgeStyle(lead.status)}`}>
                          {lead.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-450 dark:text-slate-500">
                        {formatLeadDate(lead.updatedAt)}
                      </td>
                      <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleThreeDotClick(e, lead._id)}
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer flex items-center justify-center ml-auto"
                        >
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE RESPONSIVE CARDS VIEW */}
          <div className="md:hidden flex flex-col gap-2.5 select-none">
            {currentLeads.map((lead, idx) => {
              const bgColors = [
                'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                'bg-violet-500/10 text-violet-600 dark:text-violet-400',
                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                'bg-amber-500/10 text-amber-600 dark:text-amber-400',
              ];
              const colorClass = bgColors[idx % bgColors.length];

              return (
                <div
                  key={lead._id}
                  onContextMenu={(e) => handleRowContextMenu(e, lead._id)}
                  onClick={() => {
                    setSelectedLeadId(lead._id);
                    setCurrentPage('lead-detail');
                  }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/85 p-3 rounded-xl shadow-3xs hover:border-primary/40 transition-all text-left flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center font-bold text-xs shrink-0 shadow-3xs`}>
                      {getInitials(lead.name)}
                    </div>
                    <div className="text-left">
                      <h4 className="font-sans font-bold text-xs text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight">
                        {lead.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-slate-450 dark:text-slate-500">
                          {lead.mobileNumber}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">•</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">
                          {formatBusinessTypeLabel(lead.businessType)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className={`px-2 py-0.5 rounded-full border text-[8px] font-bold ${getStatusBadgeStyle(lead.status)}`}>
                      {lead.status.toUpperCase()}
                    </span>
                    <button
                      onClick={(e) => handleThreeDotClick(e, lead._id)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 dark:hover:text-slate-205 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">more_vert</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Absolute Context Menu for Dropdowns & Cursor triggers */}
          {activeMenuLeadId && menuPosition && (
            <div
              id="leads-context-menu"
              className="fixed bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1 w-44 animate-zoom-in text-left border-slate-200/85"
              style={{
                top: `${menuPosition.y}px`,
                left: `${menuPosition.x}px`,
              }}
              onClick={(e) => e.stopPropagation()} // Prevent closing menu on internal click
            >
              <button
                onClick={() => handleMenuAction('view', activeMenuLeadId)}
                className="w-full px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-sans text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-450 dark:text-slate-400">visibility</span>
                View Profile & Chat
              </button>
              <button
                onClick={() => handleMenuAction('edit', activeMenuLeadId)}
                className="w-full px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-sans text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-450 dark:text-slate-400">edit</span>
                Edit Contact
              </button>
              <div className="h-[1px] bg-slate-100 dark:bg-slate-700 my-1" />
              <button
                onClick={() => handleMenuAction('delete', activeMenuLeadId)}
                className="w-full px-3.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-sans text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[16px] text-red-450 dark:text-red-400">delete</span>
                Delete Contact
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 rounded-xl mt-6">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, leads.length)} of {leads.length} entries
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPageNum === 1}
                onClick={() => setCurrentPageNum((prev) => prev - 1)}
                className="p-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-slate-600 dark:text-slate-350"
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
                      : 'hover:bg-slate-105/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {pageIdx + 1}
                </button>
              ))}

              <button
                disabled={currentPageNum === totalPages}
                onClick={() => setCurrentPageNum((prev) => prev - 1)}
                className="p-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-slate-600 dark:text-slate-350"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 font-bold text-xs">
          No contacts found matching current search or filters.
        </div>
      )}

      {/* Add / Edit Form Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-[500px] max-w-full rounded-2xl shadow-xl overflow-hidden animate-zoom-in text-slate-800 dark:text-slate-100">
            
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850/80">
              <h3 className="font-sans font-bold text-sm text-slate-950 dark:text-white">
                {modalMode === 'create' ? 'Create New Contact' : 'Edit Contact Details'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                {formError && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/35 text-red-655 dark:text-red-400 rounded-xl text-xs flex items-center gap-2 font-bold">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{formError}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-205 dark:border-slate-700/80 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100 font-sans font-medium"
                    placeholder="E.g. Jane Doe"
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Mobile Number (With Country Code) *
                  </label>
                  <input
                    type="tel"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-205 dark:border-slate-700/80 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100 font-mono"
                    placeholder="E.g. +919876543210"
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-205 dark:border-slate-700/80 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100 font-sans font-medium"
                    placeholder="jane.doe@company.com"
                  />
                </div>

                {/* Selectors grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                      Business Type *
                    </label>
                    <select
                      value={formBusinessType}
                      onChange={(e) => setFormBusinessType(e.target.value as BusinessType)}
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-205 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      <option value="real_estate">Real Estate</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="finance">Finance</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="travel">Travel</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                      Contact Status *
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as LeadStatus)}
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-205 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="responded">Responded</option>
                      <option value="converted">Converted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Admin Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-205 dark:border-slate-700/80 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-800 dark:text-slate-100 font-sans resize-none font-medium leading-relaxed"
                    placeholder="Enter any initial notes about this contact..."
                  />
                </div>
              </div>

              {/* Form Footer Action */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-95 transition-all cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Contact"
        message={`Are you sure you want to permanently delete contact "${leadToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

    </div>
  );
};
export default LeadsList;
