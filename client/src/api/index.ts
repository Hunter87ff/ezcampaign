import type { Lead, Template, MessageLog, CallLog, ActivityLog, User } from '../types';

// Utility delay function to simulate network loading
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  LEADS: 'ez_leads',
  TEMPLATES: 'ez_templates',
  MESSAGES: 'ez_messages',
  CALLS: 'ez_calls',
  ACTIVITIES: 'ez_activities',
  USER: 'ez_user',
  TOKEN: 'ez_token',
};

// Initial Seed Data
const initialLeads: Lead[] = [
  {
    _id: 'l1',
    name: 'Jane Doe',
    mobileNumber: '+919876543210',
    email: 'jane.doe@example.com',
    businessType: 'real_estate',
    status: 'new',
    notes: 'Requested price sheet for Phase 2 apartments.',
    isDeleted: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'l2',
    name: 'Rahul Sharma',
    mobileNumber: '+918877655443',
    email: 'rahul.sharma@medtech.com',
    businessType: 'healthcare',
    status: 'contacted',
    notes: 'Interested in the patient booking system and SMS updates.',
    isDeleted: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'l3',
    name: 'Anita Mishra',
    mobileNumber: '+917766544332',
    email: 'anita.mishra@edusmart.org',
    businessType: 'education',
    status: 'converted',
    notes: 'Trial set up for primary school board of directors. Very positive feedback.',
    isDeleted: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'l4',
    name: 'Kiran Kumar',
    mobileNumber: '+919122334455',
    email: 'kiran.k@homerealty.in',
    businessType: 'real_estate',
    status: 'responded',
    notes: 'Negotiating discount for bulk purchase. Needs approval on custom fields.',
    isDeleted: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'l5',
    name: 'David Miller',
    mobileNumber: '+916291745601',
    email: 'david.m@shophere.com',
    businessType: 'ecommerce',
    status: 'closed',
    notes: 'Lead closed. Budget too low for enterprise campaign model.',
    isDeleted: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'l6',
    name: 'Sarah Jenkins',
    mobileNumber: '+15552348901',
    email: 'sarah.j@travelworld.com',
    businessType: 'travel',
    status: 'new',
    notes: 'Captured from Summer Sale Facebook Ad. Wants details on European flight deals.',
    isDeleted: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

const initialTemplates: Template[] = [
  {
    _id: 't1',
    name: 'Welcome & Portfolio Share',
    templateSid: 'HXdc1311d3869ec9e14c9ced8023d7e3e7', // Actual Sid for testing
    businessType: 'real_estate',
    variables: ['name'],
    sampleBody: "Hello {{1}}, welcome to Campaign Manager! We're excited to help you scale your real estate communications.",
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 't2',
    name: 'Healthcare Clinic Onboarding',
    templateSid: 'HXhc826391dcbabf73ab101cd3789013ef',
    businessType: 'healthcare',
    variables: ['name'],
    sampleBody: 'Hi {{1}}, this is a friendly reminder of your appointment scheduled for tomorrow. Please reply YES to confirm.',
    isActive: true,
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 't3',
    name: 'Education Admission Guide',
    templateSid: 'HXed18274a12baefab928a381c8b7c7b8d',
    businessType: 'education',
    variables: ['name'],
    sampleBody: 'Dear {{1}}, your application guide is ready. Please view the brochure and contact admissions with any questions.',
    isActive: true,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 't4',
    name: 'Ecommerce Cart Recovery',
    templateSid: 'HXec2837482bcdeab8839cc28cbb8b88d3',
    businessType: 'ecommerce',
    variables: ['name'],
    sampleBody: 'Hi {{1}}, you left items in your cart! Here is a 10% discount code [DISCOUNT10] to complete your checkout.',
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 't5',
    name: 'Finance Consultation Request',
    templateSid: 'HXfi3847291bacdebb839ee38c11aa99cd',
    businessType: 'finance',
    variables: ['name'],
    sampleBody: 'Hello {{1}}, your consultation request has been received. Our advisors will call you shortly on this number.',
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 't6',
    name: 'Table Reservation Alert',
    templateSid: 'HXre9827384bcdfeff773a98cc12d8a2bf',
    businessType: 'restaurant',
    variables: ['name'],
    sampleBody: 'Greetings {{1}}! We have confirmed your table booking for tonight. We look forward to serving you!',
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const initialMessages: MessageLog[] = [
  {
    _id: 'm1',
    leadId: 'l1',
    direction: 'outbound',
    templateSid: 'HXdc1311d3869ec9e14c9ced8023d7e3e7',
    body: "Hello Jane Doe, welcome to Campaign Manager! We're excited to help you scale your real estate communications.",
    twilioSid: 'SM1283719827391ab102a9b2b3b',
    status: 'read',
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'm2',
    leadId: 'l1',
    direction: 'inbound',
    body: 'Thank you! Can you share pricing for apartments in Gurgaon sector 45?',
    twilioSid: 'SM8237192837129bca1029ab122',
    status: 'delivered',
    sentAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'm3',
    leadId: 'l3',
    direction: 'outbound',
    templateSid: 'HXed18274a12baefab928a381c8b7c7b8d',
    body: 'Dear Anita Mishra, your application guide is ready. Please view the brochure and contact admissions with any questions.',
    twilioSid: 'SM739281938291aba28b3c99ab21',
    status: 'read',
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'm4',
    leadId: 'l3',
    direction: 'inbound',
    body: 'I have received the guide. The board of directors has approved the pilot test.',
    twilioSid: 'SM382910398291aacbc19d9b1c2',
    status: 'read',
    sentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const initialCalls: CallLog[] = [
  {
    _id: 'c1',
    leadId: 'l2',
    phoneNumber: '+918877655443',
    twilioCallSid: 'CA1028371829371ac192ab3b4c9e8d',
    status: 'completed',
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000 + 450000).toISOString(), // 7m 30s
    duration: 450,
  },
  {
    _id: 'c2',
    leadId: 'l2',
    phoneNumber: '+918877655443',
    twilioCallSid: 'CA8172938192837dca90289ab2c3d1',
    status: 'no-answer',
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30000).toISOString(),
    duration: 0,
  },
  {
    _id: 'c3',
    leadId: 'l3',
    phoneNumber: '+917766544332',
    twilioCallSid: 'CA38291829193bde1a88cb39d2c18d',
    status: 'completed',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 765000).toISOString(), // 12m 45s
    duration: 765,
  },
];

const initialActivities: ActivityLog[] = [
  {
    _id: 'a1',
    leadId: 'l1',
    action: 'lead_created',
    details: { message: 'Jane Doe was added to leads via Real Estate Ad campaign.' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'a2',
    leadId: 'l1',
    action: 'message_sent',
    details: { templateSid: 'HXdc1311d3869ec9e14c9ced8023d7e3e7', direction: 'outbound' },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'a3',
    leadId: 'l1',
    action: 'reply_received',
    details: { text: 'Thank you! Can you share pricing for apartments in Gurgaon sector 45?' },
    createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'a4',
    leadId: 'l2',
    action: 'call_initiated',
    details: { status: 'completed', duration: '7m 30s' },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Database Seeder
const seedDatabase = () => {
  if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(initialLeads));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(initialTemplates));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(initialMessages));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CALLS)) {
    localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(initialCalls));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(initialActivities));
  }
};

// Seed immediate
seedDatabase();

// Helper to retrieve parsed list from local storage
const getList = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Helper to save parsed list to local storage
const saveList = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const apiService = {
  // Authentication
  async login(credentials: { email: string; password: string }): Promise<{ token: string; user: User }> {
    await delay(600);
    if (credentials.email === 'admin@company.com' && credentials.password === 'Admin@123') {
      const mockUser: User = {
        _id: 'u1',
        name: 'Alex Rivera',
        email: 'admin@company.com',
        role: 'Super Admin',
        createdAt: new Date(2025, 0, 1).toISOString(),
      };
      const mockToken = 'jwt-mock-token-2026';
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
      localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
      return { token: mockToken, user: mockUser };
    }
    throw new Error('Invalid email or password.');
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // Leads CRUD
  async getLeads(filters?: { search?: string; businessType?: string; status?: string }): Promise<Lead[]> {
    await delay(300);
    let leads = getList<Lead>(STORAGE_KEYS.LEADS).filter((l) => !l.isDeleted);
    
    if (filters) {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        leads = leads.filter(
          (l) => l.name.toLowerCase().includes(query) || l.mobileNumber.includes(query)
        );
      }
      if (filters.businessType && filters.businessType !== 'all') {
        leads = leads.filter((l) => l.businessType === filters.businessType);
      }
      if (filters.status && filters.status !== 'all') {
        leads = leads.filter((l) => l.status === filters.status);
      }
    }
    
    // Sort by createdAt desc
    return leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async saveLead(lead: Partial<Lead>): Promise<Lead> {
    await delay(300);
    const leads = getList<Lead>(STORAGE_KEYS.LEADS);
    const now = new Date().toISOString();

    if (lead._id) {
      // Edit mode
      const idx = leads.findIndex((l) => l._id === lead._id);
      if (idx === -1) throw new Error('Lead not found');
      
      const updated = {
        ...leads[idx],
        ...lead,
        updatedAt: now,
      } as Lead;
      leads[idx] = updated;
      saveList(STORAGE_KEYS.LEADS, leads);
      return updated;
    } else {
      // Create mode
      const newLead: Lead = {
        _id: 'l_' + Math.random().toString(36).substring(2, 9),
        name: lead.name || 'Unnamed Lead',
        mobileNumber: lead.mobileNumber || '',
        email: lead.email,
        businessType: lead.businessType || 'other',
        status: lead.status || 'new',
        notes: lead.notes || '',
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      };
      
      leads.push(newLead);
      saveList(STORAGE_KEYS.LEADS, leads);

      // Log activity
      this.logActivity(newLead._id, 'lead_created', {
        message: `Lead ${newLead.name} (${newLead.businessType}) was created manually.`,
      });

      return newLead;
    }
  },

  async deleteLead(id: string): Promise<boolean> {
    await delay(300);
    const leads = getList<Lead>(STORAGE_KEYS.LEADS);
    const idx = leads.findIndex((l) => l._id === id);
    if (idx !== -1) {
      leads[idx].isDeleted = true;
      leads[idx].updatedAt = new Date().toISOString();
      saveList(STORAGE_KEYS.LEADS, leads);
      return true;
    }
    return false;
  },

  // Templates CRUD
  async getTemplates(businessType?: string): Promise<Template[]> {
    await delay(200);
    let templates = getList<Template>(STORAGE_KEYS.TEMPLATES);
    if (businessType && businessType !== 'all') {
      templates = templates.filter((t) => t.businessType === businessType);
    }
    return templates.filter((t) => t.isActive);
  },

  async saveTemplate(template: Partial<Template>): Promise<Template> {
    await delay(300);
    const templates = getList<Template>(STORAGE_KEYS.TEMPLATES);
    const now = new Date().toISOString();

    const newTemplate: Template = {
      _id: 't_' + Math.random().toString(36).substring(2, 9),
      name: template.name || 'New Template',
      templateSid: template.templateSid || 'HX' + Math.random().toString(36).substring(2, 12),
      businessType: template.businessType || 'other',
      variables: template.variables || ['name'],
      sampleBody: template.sampleBody || 'Hello {{1}}!',
      isActive: true,
      createdAt: now,
    };
    
    templates.push(newTemplate);
    saveList(STORAGE_KEYS.TEMPLATES, templates);
    return newTemplate;
  },

  async deleteTemplate(id: string): Promise<boolean> {
    await delay(200);
    const templates = getList<Template>(STORAGE_KEYS.TEMPLATES);
    const idx = templates.findIndex((t) => t._id === id);
    if (idx !== -1) {
      templates.splice(idx, 1);
      saveList(STORAGE_KEYS.TEMPLATES, templates);
      return true;
    }
    return false;
  },

  // Messages / Chat
  async getMessages(leadId: string): Promise<MessageLog[]> {
    await delay(200);
    const messages = getList<MessageLog>(STORAGE_KEYS.MESSAGES);
    return messages
      .filter((m) => m.leadId === leadId)
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  },

  async sendMessage(leadId: string, templateSid: string, variables: Record<string, string>): Promise<MessageLog> {
    await delay(500);
    
    // Find Lead
    const leads = getList<Lead>(STORAGE_KEYS.LEADS);
    const lead = leads.find((l) => l._id === leadId);
    if (!lead) throw new Error('Lead not found');

    // Find Template
    const templates = getList<Template>(STORAGE_KEYS.TEMPLATES);
    const template = templates.find((t) => t.templateSid === templateSid);
    if (!template) throw new Error('Template not found');

    // Build message body
    let body = template.sampleBody || '';
    if (template.variables) {
      template.variables.forEach((variable, i) => {
        const value = variables[variable] || variables[(i + 1).toString()] || `[${variable}]`;
        body = body.replace(`{{${i + 1}}}`, value);
      });
    }

    const now = new Date().toISOString();
    const newLog: MessageLog = {
      _id: 'm_' + Math.random().toString(36).substring(2, 9),
      leadId,
      direction: 'outbound',
      templateSid,
      body,
      twilioSid: 'SM' + Math.random().toString(36).substring(2, 28).toUpperCase(),
      status: 'sent',
      sentAt: now,
    };

    // Save Message
    const messages = getList<MessageLog>(STORAGE_KEYS.MESSAGES);
    messages.push(newLog);
    saveList(STORAGE_KEYS.MESSAGES, messages);

    // Update Lead Status to Contacted if it was New
    if (lead.status === 'new') {
      lead.status = 'contacted';
      lead.updatedAt = now;
      saveList(STORAGE_KEYS.LEADS, leads);
    }

    // Log Activity
    this.logActivity(leadId, 'message_sent', {
      templateSid,
      body,
      status: 'sent',
    });

    // Simulate an Inbound response from Twilio Sandbox webhook 5 seconds later
    setTimeout(() => {
      this.simulateIncomingReply(leadId, lead.name);
    }, 5000);

    return newLog;
  },

  // Calling
  async initiateCall(leadId: string): Promise<CallLog> {
    await delay(800);
    
    const leads = getList<Lead>(STORAGE_KEYS.LEADS);
    const lead = leads.find((l) => l._id === leadId);
    if (!lead) throw new Error('Lead not found');

    const now = new Date().toISOString();
    const newCall: CallLog = {
      _id: 'c_' + Math.random().toString(36).substring(2, 9),
      leadId,
      phoneNumber: lead.mobileNumber,
      twilioCallSid: 'CA' + Math.random().toString(36).substring(2, 28).toUpperCase(),
      status: 'initiated',
      startTime: now,
    };

    const calls = getList<CallLog>(STORAGE_KEYS.CALLS);
    calls.push(newCall);
    saveList(STORAGE_KEYS.CALLS, calls);

    // Log Activity
    this.logActivity(leadId, 'call_initiated', {
      callSid: newCall.twilioCallSid,
      phoneNumber: newCall.phoneNumber,
    });

    // Simulate call ringing & completion state changes after timeout
    setTimeout(() => {
      this.updateCallStatus(newCall._id, 'completed', 45); // 45 seconds call
    }, 3000);

    return newCall;
  },

  async getCallLogs(leadId?: string): Promise<CallLog[]> {
    await delay(300);
    const calls = getList<CallLog>(STORAGE_KEYS.CALLS);
    let result = calls;
    if (leadId) {
      result = calls.filter((c) => c.leadId === leadId);
    }
    return result.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  },

  // Activities Feed
  async getActivityLogs(): Promise<ActivityLog[]> {
    await delay(200);
    return getList<ActivityLog>(STORAGE_KEYS.ACTIVITIES)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Analytics
  async getAnalyticsSummary() {
    await delay(400);
    const leads = getList<Lead>(STORAGE_KEYS.LEADS).filter((l) => !l.isDeleted);
    const messages = getList<MessageLog>(STORAGE_KEYS.MESSAGES);

    // Lead Status breakdown
    const leadStatusBreakdown: Record<string, number> = {
      new: 0,
      contacted: 0,
      responded: 0,
      converted: 0,
      closed: 0,
    };
    leads.forEach((l) => {
      if (leadStatusBreakdown[l.status] !== undefined) {
        leadStatusBreakdown[l.status]++;
      }
    });

    // Messages per day (Last 7 Days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const messagesPerDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      messagesPerDay[days[d.getDay()]] = 0;
    }
    messages.forEach((m) => {
      const day = days[new Date(m.sentAt).getDay()];
      if (messagesPerDay[day] !== undefined) {
        messagesPerDay[day]++;
      }
    });

    // Calculations
    const totalLeads = leads.length;
    const messagesSent = messages.filter((m) => m.direction === 'outbound').length;
    const activeCampaigns = getList<Template>(STORAGE_KEYS.TEMPLATES).filter(t => t.isActive).length;
    
    const convertedCount = leads.filter((l) => l.status === 'converted').length;
    const conversionRate = totalLeads > 0 ? parseFloat(((convertedCount / totalLeads) * 100).toFixed(1)) : 0;

    const topCampaigns = [
      { name: 'Welcome Onboarding', cr: '24%', sent: messagesSent > 10 ? Math.floor(messagesSent * 0.45) : 124 },
      { name: 'Abandoned Cart Followup', cr: '18%', sent: messagesSent > 10 ? Math.floor(messagesSent * 0.35) : 92 },
      { name: 'Schedule Reminder Q3', cr: '12%', sent: messagesSent > 10 ? Math.floor(messagesSent * 0.20) : 48 },
    ];

    return {
      totalLeads,
      messagesSent,
      activeCampaigns,
      conversionRate,
      messagesPerDay,
      leadStatusBreakdown,
      topCampaigns,
    };
  },

  // Helper Simulators (Internal)
  logActivity(leadId: string | undefined, action: ActivityLog['action'], details: any) {
    const activities = getList<ActivityLog>(STORAGE_KEYS.ACTIVITIES);
    const newAct: ActivityLog = {
      _id: 'a_' + Math.random().toString(36).substring(2, 9),
      leadId,
      action,
      details,
      createdAt: new Date().toISOString(),
    };
    activities.push(newAct);
    saveList(STORAGE_KEYS.ACTIVITIES, activities);
  },

  updateCallStatus(id: string, status: CallLog['status'], duration: number) {
    const calls = getList<CallLog>(STORAGE_KEYS.CALLS);
    const idx = calls.findIndex((c) => c._id === id);
    if (idx !== -1) {
      const startTime = new Date(calls[idx].startTime).getTime();
      const endTime = new Date(startTime + duration * 1000).toISOString();
      
      calls[idx].status = status;
      calls[idx].endTime = endTime;
      calls[idx].duration = duration;
      saveList(STORAGE_KEYS.CALLS, calls);

      // Log activity
      this.logActivity(calls[idx].leadId, 'call_initiated', {
        status,
        duration: `${Math.floor(duration / 60)}m ${duration % 60}s`,
      });

      // Update lead status to responded if they answered
      const leads = getList<Lead>(STORAGE_KEYS.LEADS);
      const leadIdx = leads.findIndex((l) => l._id === calls[idx].leadId);
      if (leadIdx !== -1 && leads[leadIdx].status === 'contacted') {
        leads[leadIdx].status = 'responded';
        leads[leadIdx].updatedAt = new Date().toISOString();
        saveList(STORAGE_KEYS.LEADS, leads);
      }
    }
  },

  simulateIncomingReply(leadId: string, leadName: string) {
    const messages = getList<MessageLog>(STORAGE_KEYS.MESSAGES);
    
    // Check if reply already triggered recently to avoid infinite loops
    const lastReply = messages
      .filter((m) => m.leadId === leadId && m.direction === 'inbound')
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0];
    
    if (lastReply && (Date.now() - new Date(lastReply.sentAt).getTime() < 10000)) {
      return; // Skip if sent in last 10s
    }

    const replies = [
      `Thanks for reaching out! I checked the details and I'd like to schedule a demo.`,
      `Got it. Could you also share some case studies of this template program?`,
      `Interesting offer. Is there any seasonal discount for education institutions?`,
      `Thank you! I will talk to my partner and get back to you by tomorrow morning.`,
      `Hello! Yes, let's connect. I'm available at 11 AM today.`
    ];
    const text = replies[Math.floor(Math.random() * replies.length)];

    const now = new Date().toISOString();
    const inboundMsg: MessageLog = {
      _id: 'm_' + Math.random().toString(36).substring(2, 9),
      leadId,
      direction: 'inbound',
      body: text,
      twilioSid: 'SM' + Math.random().toString(36).substring(2, 28).toUpperCase(),
      status: 'delivered',
      sentAt: now,
    };

    messages.push(inboundMsg);
    saveList(STORAGE_KEYS.MESSAGES, messages);

    // Update lead status to responded
    const leads = getList<Lead>(STORAGE_KEYS.LEADS);
    const idx = leads.findIndex((l) => l._id === leadId);
    if (idx !== -1) {
      leads[idx].status = 'responded';
      leads[idx].updatedAt = now;
      saveList(STORAGE_KEYS.LEADS, leads);
    }

    // Log activity
    this.logActivity(leadId, 'reply_received', {
      message: `Incoming reply from ${leadName}: "${text}"`,
    });

    // Notify window components to refresh if page is viewing this lead
    window.dispatchEvent(new CustomEvent('ez_message_received', { detail: { leadId } }));
  },
};
