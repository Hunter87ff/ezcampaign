import { z } from 'zod';

// Business Type enum matching types/index.ts
export const businessTypes = [
  'real_estate',
  'healthcare',
  'education',
  'ecommerce',
  'finance',
  'restaurant',
  'travel',
  'other',
] as const;

// Lead Status enum matching types/index.ts
export const leadStatuses = ['new', 'contacted', 'responded', 'converted', 'closed'] as const;

// 1. Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// 2. Lead Schemas
export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobileNumber: z.string().regex(/^\+\d{10,15}$/, 'Mobile number must be in international format (e.g. +91XXXXXXXXXX)'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  businessType: z.enum(businessTypes, {
    message: 'Invalid business segment type',
  }),
  status: z.enum(leadStatuses).optional(),
  notes: z.string().optional(),
  assignedTemplateId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid template ID').optional().or(z.literal('')),
});

export const updateLeadSchema = createLeadSchema.partial();

// 3. Template Schemas
export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  templateSid: z.string().min(1, 'Twilio Content SID is required'),
  businessType: z.enum(businessTypes, {
    message: 'Invalid business segment type',
  }),
  variables: z.array(z.string()).optional(),
  sampleBody: z.string().optional(),
  isActive: z.boolean().optional(),
});

// 4. Message Schemas
export const sendMessageSchema = z.object({
  leadId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lead ID'),
  templateId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid template ID').optional(),
  body: z.string().optional(),
  variables: z.record(z.string(), z.string()).optional(),
}).refine((data) => data.templateId || data.body, {
  message: 'Either templateId or message body is required',
  path: ['templateId', 'body'],
});

// 5. Call Schemas
export const initiateCallSchema = z.object({
  leadId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lead ID'),
  message: z.string().min(1, 'Message is required'),
});

export const validator = {
  auth: { loginSchema },
  lead: { createLeadSchema, updateLeadSchema },
  template: { createTemplateSchema },
  message: { sendMessageSchema },
  call: { initiateCallSchema },
};

export default validator;
