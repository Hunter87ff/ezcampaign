import React, { useEffect, useState } from 'react';
import { apiService } from '../../api';
import type { Template, BusinessType } from '../../types';

interface TemplatesProps {
  searchQuery: string;
}

export const TemplatesList: React.FC<TemplatesProps> = ({ searchQuery }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSid, setFormSid] = useState('');
  const [formSegment, setFormSegment] = useState<BusinessType>('real_estate');
  const [formBody, setFormBody] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await apiService.getTemplates(
        selectedSegment === 'all' ? undefined : selectedSegment
      );
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [selectedSegment]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete template "${name}"?`)) {
      try {
        await apiService.deleteTemplate(id);
        fetchTemplates();
      } catch (err) {
        console.error('Failed to delete template:', err);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formSid.trim() || !formBody.trim()) {
      setFormError('All fields are required.');
      return;
    }

    if (!formSid.startsWith('HX') || formSid.length < 15) {
      setFormError('Twilio Content SID must start with "HX" and be at least 15 characters long.');
      return;
    }

    // Auto extract variables from {{1}}, {{2}}...
    const variableMatches = formBody.match(/\{\{\d+\}\}/g);
    const variables = variableMatches ? variableMatches.map((_, i) => i === 0 ? 'name' : `var_${i + 1}`) : ['name'];

    try {
      await apiService.saveTemplate({
        name: formName.trim(),
        templateSid: formSid.trim(),
        businessType: formSegment,
        variables,
        sampleBody: formBody.trim(),
      });
      setIsModalOpen(false);
      // Reset form
      setFormName('');
      setFormSid('');
      setFormBody('');
      fetchTemplates();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create template.');
    }
  };

  // Filter templates matching search query
  const filteredTemplates = templates.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      t.templateSid.toLowerCase().includes(query) ||
      t.sampleBody?.toLowerCase().includes(query)
    );
  });

  const formatBusinessTypeLabel = (type: BusinessType) => {
    return type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="p-container-padding max-w-max-width mx-auto animate-fade-in select-none">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-text-primary dark:text-text-primary font-bold">
            WhatsApp Template Management
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Create, view, and tag templates corresponding to lead business segments.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create Template
        </button>
      </div>

      {/* Segment filters options */}
      <div className="flex items-center gap-3 mb-6 bg-surface-container-lowest dark:bg-surface-container-lowest p-4 rounded-xl border border-surface-border">
        <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider font-bold">
          Filter by Segment:
        </span>
        <div className="relative">
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="appearance-none bg-surface-container-low border border-surface-border rounded-lg pl-4 pr-10 py-2 text-body-md text-on-surface focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="all">All Segments</option>
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
      </div>

      {/* Templates display list grid */}
      {loading ? (
        <div className="p-12 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="font-semibold text-body-md">Reading template logs...</span>
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {filteredTemplates.map((t) => (
            <div
              key={t._id}
              className="bg-surface-container-lowest border border-surface-border p-5 rounded-xl hover:border-primary transition-all flex flex-col justify-between group shadow-2xs relative"
            >
              
              {/* Card Title */}
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="font-headline-md text-[18px] font-bold text-text-primary dark:text-text-primary leading-tight">
                    {t.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-surface-border text-label-sm font-label-sm font-bold shrink-0">
                    {formatBusinessTypeLabel(t.businessType)}
                  </span>
                </div>
                
                {/* Twilio Sid Label */}
                <p className="text-label-sm text-on-surface-variant font-mono tracking-wide mb-4">
                  SID: {t.templateSid}
                </p>
                
                {/* Body Preview */}
                <div className="bg-surface-container-low/50 border border-surface-border p-3.5 rounded-lg mb-4">
                  <p className="font-body-md text-on-surface-variant italic leading-relaxed">
                    "{t.sampleBody}"
                  </p>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-surface-border">
                <span className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-wider">
                  Active in campaign
                </span>
                
                {t.templateSid !== 'HXdc1311d3869ec9e14c9ced8023d7e3e7' ? (
                  <button
                    onClick={() => handleDelete(t._id, t.name)}
                    className="p-1.5 rounded-lg hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-colors flex items-center justify-center cursor-pointer"
                    title="Delete Template"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-primary bg-primary-container/20 px-2 py-0.5 rounded uppercase">
                    System Default
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-on-surface-variant font-medium border border-dashed border-surface-border rounded-xl">
          No templates match filters.
        </div>
      )}

      {/* Create Template modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-container-lowest border border-surface-border w-[500px] max-w-full rounded-2xl shadow-xl overflow-hidden animate-zoom-in text-on-surface">
            
            <div className="px-6 py-4 border-b border-surface-border flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline-md text-headline-md font-bold text-text-primary">
                Create Campaign Template
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
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-border rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all text-on-surface"
                    placeholder="E.g. Discount Welcome Code"
                    required
                  />
                </div>

                {/* Content SID */}
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-1.5 font-bold">
                    Twilio Content SID *
                  </label>
                  <input
                    type="text"
                    value={formSid}
                    onChange={(e) => setFormSid(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-border rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all text-on-surface font-mono"
                    placeholder="E.g. HXda90183ac12abf"
                    required
                  />
                </div>

                {/* Business Type dropdown */}
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-1.5 font-bold">
                    Target Business Segment *
                  </label>
                  <select
                    value={formSegment}
                    onChange={(e) => setFormSegment(e.target.value as BusinessType)}
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

                {/* Template body */}
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-1.5 font-bold">
                    Template Body Text *
                  </label>
                  <textarea
                    rows={4}
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-border rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all text-on-surface resize-none leading-relaxed"
                    placeholder="Hello {{1}}, welcome! Put numbers inside double brackets to establish variables."
                    required
                  />
                  <span className="text-[10px] text-on-surface-variant/80 mt-1 block">
                    Note: Put {"{{1}}"} for Lead Name, {"{{2}}"} for other variables. They will be resolved dynamically during dispatch.
                  </span>
                </div>
              </div>

              {/* Form Footer */}
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
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default TemplatesList;
