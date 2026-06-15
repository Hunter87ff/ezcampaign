export type Page = 'dashboard' | 'leads' | 'lead-detail' | 'templates' | 'call-logs' | 'settings';

export type BusinessType =
  | 'real_estate'
  | 'healthcare'
  | 'education'
  | 'ecommerce'
  | 'finance'
  | 'restaurant'
  | 'travel'
  | 'other';

export type LeadStatus = 'new' | 'contacted' | 'responded' | 'converted' | 'closed';

export interface Lead {
  _id: string;
  name: string;
  mobileNumber: string;
  email?: string;
  businessType: BusinessType;
  status: LeadStatus;
  notes?: string;
  assignedTemplateId?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  _id: string;
  name: string;
  templateSid: string;
  businessType: BusinessType;
  variables?: string[];
  sampleBody?: string;
  isActive: boolean;
  createdAt: string;
}

export interface MessageLog {
  _id: string;
  leadId: string;
  direction: 'outbound' | 'inbound';
  templateSid?: string;
  body: string;
  twilioSid: string;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string;
}

export interface CallLog {
  _id: string;
  leadId: string;
  phoneNumber: string;
  twilioCallSid: string;
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'no-answer' | 'busy' | 'failed';
  startTime: string;
  endTime?: string;
  duration?: number; // duration in seconds
}

export interface ActivityLog {
  _id: string;
  leadId?: string;
  action: 'message_sent' | 'call_initiated' | 'lead_created' | 'reply_received';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any>;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}
