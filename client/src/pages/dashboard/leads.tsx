import React, { useEffect, useState } from 'react';
import { apiService } from '../../api';
import type { Lead, BusinessType, LeadStatus } from '../../types';

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
  const itemsPerPage = 5;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingLead, setEditingLead] = useState<Partial<Lead> | null>(null);

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

  useEffect(() => {
    fetchLeads();
  }, [searchQuery, selectedBusinessType, selectedStatus]);

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

    // Basic mobile validation (+91 or + followed by 10-12 digits)
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
    } catch (err: any) {
      setFormError(err.message || 'Failed to save lead.');
    }
  };

  // Soft Delete Action
  const handleDeleteLead = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete lead ${name}?`)) {
      try {
        await apiService.deleteLead(id);
        fetchLeads();
      } catch (err) {
        console.error('Failed to delete lead:', err);
      }
    }
  };

  // Clear Filters
  const handleClearFilters = () => {
    setSelectedBusinessType('all');
    setSelectedStatus('all');
  };

  // Paginated Leads Calculations
  const indexOfLastItem = currentPageNum * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeads = leads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leads.length / itemsPerPage);

  const getStatusBadgeStyle = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return 'bg-status-new/10 text-status-new border-status-new/20';
      case 'contacted':
        return 'bg-status-contacted/10 text-status-contacted border-status-contacted/20';
      case 'responded':
        return 'bg-status-responded/10 text-status-responded border-status-responded/20';
      case 'converted':
        return 'bg-status-converted/10 text-status-converted border-status-converted/20';
      case 'closed':
        return 'bg-status-closed/10 text-status-closed border-status-closed/20';
      default:
        return 'bg-surface-container text-on-surface-variant border-surface-border';
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
    <div className="p-container-padding max-w-max-width mx-auto animate-fade-in select-none">
      
      {/* Title & Add Lead Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-text-primary dark:text-text-primary">
            Leads Management
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Monitor, edit, and engage with your WhatsApp business leads.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Lead
        </button>
      </div>

      {/* Filter and Clear Filter Options */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-surface-container-lowest dark:bg-surface-container-lowest p-4 rounded-xl border border-surface-border transition-colors">
        <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider font-bold">
          Filter by:
        </span>
        
        {/* Business Type Selector */}
        <div className="relative">
          <select
            value={selectedBusinessType}
            onChange={(e) => setSelectedBusinessType(e.target.value)}
            className="appearance-none bg-surface-container-low border border-surface-border rounded-lg pl-4 pr-10 py-2 text-body-md text-on-surface focus:ring-1 focus:ring-primary outline-none cursor-pointer"
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
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
            expand_more
          </span>
        </div>

        {/* Status Selector */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none bg-surface-container-low border border-surface-border rounded-lg pl-4 pr-10 py-2 text-body-md text-on-surface focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="responded">Responded</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
            expand_more
          </span>
        </div>

        {/* Reset Filters Trigger */}
        {(selectedBusinessType !== 'all' || selectedStatus !== 'all') && (
          <button
            onClick={handleClearFilters}
            className="ml-auto text-label-md font-label-md text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list_off</span>
            Clear All Filters
          </button>
        )}
      </div>

      {/* Leads Table Container */}
      <div className="bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-semibold text-body-md">Querying directory...</span>
          </div>
        ) : leads.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-border text-on-surface-variant">
                    <th className="px-container-padding py-4 text-label-md font-label-md uppercase tracking-wider">Name</th>
                    <th className="px-container-padding py-4 text-label-md font-label-md uppercase tracking-wider">Mobile Number</th>
                    <th className="px-container-padding py-4 text-label-md font-label-md uppercase tracking-wider">Business Type</th>
                    <th className="px-container-padding py-4 text-label-md font-label-md uppercase tracking-wider">Status</th>
                    <th className="px-container-padding py-4 text-label-md font-label-md uppercase tracking-wider">Last Activity</th>
                    <th className="px-container-padding py-4 text-label-md font-label-md uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-on-surface">
                  {currentLeads.map((lead, idx) => {
                    const bgColors = ['bg-primary-container/20 text-primary', 'bg-tertiary-container/20 text-tertiary', 'bg-secondary-container/20 text-secondary', 'bg-status-contacted/20 text-status-contacted'];
                    const colorClass = bgColors[idx % bgColors.length];

                    return (
                      <tr key={lead._id} className="hover:bg-surface-container-low/50 transition-colors duration-150 group">
                        <td className="px-container-padding py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center font-bold text-label-md shadow-2xs`}>
                              {getInitials(lead.name)}
                            </div>
                            <span className="font-body-md font-bold text-text-primary dark:text-text-primary">{lead.name}</span>
                          </div>
                        </td>
                        <td className="px-container-padding py-4 font-body-md text-on-surface-variant">
                          {lead.mobileNumber}
                        </td>
                        <td className="px-container-padding py-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-surface-border text-label-sm font-label-sm font-semibold">
                            {formatBusinessTypeLabel(lead.businessType)}
                          </span>
                        </td>
                        <td className="px-container-padding py-4">
                          <span className={`px-2.5 py-0.5 rounded-full border text-label-sm font-label-sm font-bold ${getStatusBadgeStyle(lead.status)}`}>
                            {lead.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-container-padding py-4 font-body-md text-on-surface-variant opacity-80">
                          {formatLeadDate(lead.updatedAt)}
                        </td>
                        <td className="px-container-padding py-4 text-right space-x-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedLeadId(lead._id);
                              setCurrentPage('lead-detail');
                            }}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title="Open Lead Profile & Chat"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          <button
                            onClick={() => openEditModal(lead)}
                            className="p-1.5 rounded-lg hover:bg-secondary/10 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
                            title="Edit Lead Details"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead._id, lead.name)}
                            className="p-1.5 rounded-lg hover:bg-error/15 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                            title="Delete Lead"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-container-padding py-4 bg-surface-container-low border-t border-surface-border">
              <span className="text-label-sm font-semibold text-on-surface-variant">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, leads.length)} of {leads.length} entries
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
            No leads found matching current search or filters.
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-container-lowest border border-surface-border w-[500px] max-w-full rounded-2xl shadow-xl overflow-hidden animate-zoom-in text-on-surface">
            
            <div className="px-6 py-4 border-b border-surface-border flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline-md text-headline-md font-bold text-text-primary">
                {modalMode === 'create' ? 'Create New Lead' : 'Edit Lead Details'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-surface-container rounded-full text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                {formError && (
                  <div className="p-3 bg-error-container/20 border border-error-container text-error rounded-lg text-label-md flex items-center gap-1.5 font-bold">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{formError}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-1.5 font-bold">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-border rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all text-on-surface"
                    placeholder="E.g. Jane Doe"
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-1.5 font-bold">
                    Mobile Number (With Country Code) *
                  </label>
                  <input
                    type="tel"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-border rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all text-on-surface"
                    placeholder="E.g. +919876543210"
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-1.5 font-bold">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-border rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all text-on-surface"
                    placeholder="jane.doe@company.com"
                  />
                </div>

                {/* Selectors grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-1.5 font-bold">
                      Business Type *
                    </label>
                    <select
                      value={formBusinessType}
                      onChange={(e) => setFormBusinessType(e.target.value as BusinessType)}
                      className="w-full bg-surface-container-low border border-surface-border rounded-lg px-3 py-2 text-body-md focus:ring-2 focus:ring-primary-container outline-none text-on-surface"
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
                    <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-1.5 font-bold">
                      Lead Status *
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as LeadStatus)}
                      className="w-full bg-surface-container-low border border-surface-border rounded-lg px-3 py-2 text-body-md focus:ring-2 focus:ring-primary-container outline-none text-on-surface"
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
                  <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-1.5 font-bold">
                    Admin Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-border rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all text-on-surface resize-none"
                    placeholder="Enter any initial notes about this lead..."
                  />
                </div>
              </div>

              {/* Form Footer Action */}
              <div className="px-6 py-4 bg-surface-container-low border-t border-surface-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 border border-surface-border rounded-lg font-bold text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default LeadsList;
