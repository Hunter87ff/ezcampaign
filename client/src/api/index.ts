import type { Lead, Template, MessageLog, CallLog, ActivityLog, User } from '../types';
import { validator } from '../validator';
import { BASE_URL, STORAGE_KEYS } from '../config';


const activeGetRequests = new Map<string, Promise<unknown>>();

// Generic API caller helper
async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; message: string; data: T }> {
  const method = options.method || 'GET';
  const isGet = method.toUpperCase() === 'GET';

  if (isGet) {
    const active = activeGetRequests.get(path);
    if (active) {
      return active as Promise<{ status: number; message: string; data: T }>;
    }
  }

  const promise = (async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers['Authorization'] = token;
      }

      const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
      });

      if (response.status === 204) {
        return { status: 204, message: 'No content', data: null as unknown as T };
      }

      let json;
      try {
        json = await response.json();
      } catch (err) {
        throw new Error(`Failed to parse response: ${response.statusText}`, { cause: err });
      }

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          window.dispatchEvent(new CustomEvent('ez_unauthorized'));
        }
        
        if (response.status === 429) {
          window.dispatchEvent(new CustomEvent('ez_rate_limited'));
        }

        throw new Error(json.message || `Request failed with status ${response.status}`);
      }

      return json;
    } finally {
      if (isGet) {
        activeGetRequests.delete(path);
      }
    }
  })();

  if (isGet) {
    activeGetRequests.set(path, promise);
  }

  return promise;
}

export const apiService = {
  // Authentication
  async login(credentials: { email: string; password: string }): Promise<{ token: string; user: User }> {
    // 1. Zod Validation
    const validation = validator.auth.loginSchema.safeParse(credentials);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => e.message).join(', ');
      throw new Error(errorMsg);
    }

    // 2. API Call
    const res = await apiRequest<{ token: string; admin: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(validation.data),
    });

    const { token, admin } = res.data;
    
    // Save to local storage
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(admin));

    return { token, user: admin };
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

  async updateProfile(profileData: { name: string; email: string; password?: string }): Promise<{ token: string; user: User }> {
    const res = await apiRequest<{ token: string; admin: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    
    const { token, admin } = res.data;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(admin));
    
    // Dispatch event to notify application components of the profile update
    window.dispatchEvent(new CustomEvent('ez_profile_updated', { detail: { user: admin } }));
    
    return { token, user: admin };
  },

  async registerUser(userData: { name: string; email: string; password: string; role: string }): Promise<{ user: User }> {
    const res = await apiRequest<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return res.data;
  },

  // Leads CRUD
  async getLeads(filters?: { search?: string; businessType?: string; status?: string }): Promise<Lead[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.businessType && filters.businessType !== 'all') {
        params.append('businessType', filters.businessType);
      }
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
    }
    
    // Default page limit is large to fetch all for client pagination
    params.append('limit', '100');

    const res = await apiRequest<{ leads: Lead[] }>(`/api/leads?${params.toString()}`);
    return res.data.leads;
  },

  async saveLead(lead: Partial<Lead>): Promise<Lead> {
    const isEdit = !!lead._id;
    
    // 1. Zod Validation
    const schema = isEdit ? validator.lead.updateLeadSchema : validator.lead.createLeadSchema;
    const validation = schema.safeParse(lead);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => e.message).join(', ');
      throw new Error(errorMsg);
    }

    // 2. API Call
    if (isEdit) {
      const res = await apiRequest<Lead>(`/api/leads/${lead._id}`, {
        method: 'PUT',
        body: JSON.stringify(validation.data),
      });
      return res.data;
    } else {
      const res = await apiRequest<Lead>('/api/leads', {
        method: 'POST',
        body: JSON.stringify(validation.data),
      });
      return res.data;
    }
  },

  async deleteLead(id: string): Promise<boolean> {
    await apiRequest(`/api/leads/${id}`, {
      method: 'DELETE',
    });
    return true;
  },

  // Templates CRUD
  async getTemplates(businessType?: string): Promise<Template[]> {
    const params = new URLSearchParams();
    if (businessType && businessType !== 'all') {
      params.append('businessType', businessType);
    }

    const res = await apiRequest<Template[]>(`/api/templates?${params.toString()}`);
    return res.data;
  },

  async saveTemplate(template: Partial<Template>): Promise<Template> {
    // 1. Zod Validation
    const validation = validator.template.createTemplateSchema.safeParse(template);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => e.message).join(', ');
      throw new Error(errorMsg);
    }

    // 2. API Call
    const res = await apiRequest<Template>('/api/templates', {
      method: 'POST',
      body: JSON.stringify(validation.data),
    });
    return res.data;
  },

  async deleteTemplate(id: string): Promise<boolean> {
    await apiRequest(`/api/templates/${id}`, {
      method: 'DELETE',
    });
    return true;
  },

  // Messages / Chat
  async getMessages(leadId: string): Promise<MessageLog[]> {
    const res = await apiRequest<{ messages: MessageLog[] }>(`/api/messages/${leadId}?limit=100`);
    
    // Sort oldest first for chat view (backend returns newest first)
    return res.data.messages.sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  },

  async sendMessage(
    leadId: string,
    templateId?: string,
    variables?: Record<string, string>,
    body?: string
  ): Promise<MessageLog> {
    const payload = { leadId, templateId, variables, body };
    
    // 1. Zod Validation
    const validation = validator.message.sendMessageSchema.safeParse(payload);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => e.message).join(', ');
      throw new Error(errorMsg);
    }

    // 2. API Call
    const res = await apiRequest<MessageLog>('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify(validation.data),
    });
    return res.data;
  },

  // Calling
  async initiateCall(leadId: string, message: string): Promise<CallLog> {
    // 1. Zod Validation
    const validation = validator.call.initiateCallSchema.safeParse({ leadId, message });
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => e.message).join(', ');
      throw new Error(errorMsg);
    }

    // 2. API Call
    const res = await apiRequest<CallLog>('/api/calls/initiate', {
      method: 'POST',
      body: JSON.stringify(validation.data),
    });
    return res.data;
  },

  async getCallLogs(leadId?: string): Promise<CallLog[]> {
    const params = new URLSearchParams();
    if (leadId) {
      params.append('leadId', leadId);
    }
    params.append('limit', '100');

    const res = await apiRequest<{ calls: CallLog[] }>(`/api/calls?${params.toString()}`);
    return res.data.calls;
  },

  async deleteCallLog(id: string): Promise<boolean> {
    await apiRequest(`/api/calls/${id}`, {
      method: 'DELETE',
    });
    return true;
  },

  // Activities Feed
  async getActivityLogs(): Promise<ActivityLog[]> {
    // Activities are returned as part of the dashboard analytics summary on the server
    const res = await apiRequest<{ recentActivities: ActivityLog[] }>('/api/analytics/summary');
    return res.data.recentActivities;
  },

  // Analytics
  async getAnalyticsSummary() {
    const res = await apiRequest<{
      leads: { total: number; statusBreakdown: Record<string, number>; businessTypeBreakdown: Record<string, number> };
      messages: { outbound: number; inbound: number; total: number; trend: Array<{ _id: string; count: number }> };
      calls: { total: number };
      activeCampaigns: number;
      recentActivities: ActivityLog[];
    }>('/api/analytics/summary');

    const serverData = res.data;

    // Calculate conversion rate
    const totalLeads = serverData.leads.total;
    const convertedCount = serverData.leads.statusBreakdown.converted || 0;
    const conversionRate = totalLeads > 0 ? parseFloat(((convertedCount / totalLeads) * 100).toFixed(1)) : 0;

    // Map messages per day trend to HSL chart format (last 7 days)
    // Convert YYYY-MM-DD from server into day of week initials
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const messagesPerDay: Record<string, number> = {};
    
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      messagesPerDay[days[d.getDay()]] = 0;
    }

    // Populate trend count
    if (serverData.messages.trend) {
      serverData.messages.trend.forEach((item) => {
        const d = new Date(item._id);
        const dayName = days[d.getDay()];
        if (messagesPerDay[dayName] !== undefined) {
          messagesPerDay[dayName] += item.count;
        }
      });
    }

    // Reconstruct status breakdown to include all statuses
    const leadStatusBreakdown: Record<string, number> = {
      new: serverData.leads.statusBreakdown.new || 0,
      contacted: serverData.leads.statusBreakdown.contacted || 0,
      responded: serverData.leads.statusBreakdown.responded || 0,
      converted: serverData.leads.statusBreakdown.converted || 0,
      closed: serverData.leads.statusBreakdown.closed || 0,
    };

    // Keep some mock campaign names but align count with active campaigns
    const topCampaigns = [
      { name: 'Welcome Onboarding', cr: '24%', sent: Math.floor(serverData.messages.outbound * 0.45) || 12 },
      { name: 'Abandoned Cart Followup', cr: '18%', sent: Math.floor(serverData.messages.outbound * 0.35) || 8 },
      { name: 'Schedule Reminder Q3', cr: '12%', sent: Math.floor(serverData.messages.outbound * 0.20) || 5 },
    ];

    return {
      totalLeads,
      messagesSent: serverData.messages.outbound,
      activeCampaigns: serverData.activeCampaigns || 0,
      conversionRate,
      messagesPerDay,
      messagesTrend: serverData.messages.trend || [],
      leadStatusBreakdown,
      topCampaigns,
      recentActivities: serverData.recentActivities,
    };
  },

  async simulateIncomingReply(leadId: string, leadMobile: string): Promise<void> {
    const replies = [
      `Thanks for reaching out! I checked the details and I'd like to schedule a demo.`,
      `Got it. Could you also share some case studies of this template program?`,
      `Interesting offer. Is there any seasonal discount for education institutions?`,
      `Thank you! I will talk to my partner and get back to you by tomorrow morning.`,
      `Hello! Yes, let's connect. I'm available at 11 AM today.`
    ];
    const text = replies[Math.floor(Math.random() * replies.length)];
    const messageSid = 'SM' + Math.random().toString(36).substring(2, 28).toUpperCase();

    // Call webhook endpoint to simulate incoming WhatsApp message in database
    await fetch(`${BASE_URL}/webhook/whatsapp/incoming`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        From: `whatsapp:${leadMobile}`,
        To: 'whatsapp:+916291745601',
        Body: text,
        MessageSid: messageSid,
      }),
    });

    // Notify window components to refresh
    window.dispatchEvent(new CustomEvent('ez_message_received', { detail: { leadId } }));
  },

  async getServerConfig(): Promise<{ accountSid: string; authToken: string; whatsappNum: string; phoneNum: string; templateSid: string; baseUrl: string }> {
    const res = await apiRequest<{ accountSid: string; authToken: string; whatsappNum: string; phoneNum: string; templateSid: string; baseUrl: string }>('/api/config');
    return res.data;
  },

  async updateServerConfig(data: { accountSid: string; authToken: string; whatsappNum: string; phoneNum: string; templateSid: string; baseUrl: string }): Promise<{ accountSid: string; authToken: string; whatsappNum: string; phoneNum: string; templateSid: string; baseUrl: string }> {
    const res = await apiRequest<{ accountSid: string; authToken: string; whatsappNum: string; phoneNum: string; templateSid: string; baseUrl: string }>('/api/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },
};

