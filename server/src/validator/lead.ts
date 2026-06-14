import { z } from "zod";
import { BusinessType, LeadStatus } from "@/enums";

export const createLeadSchema = z.object({
    name: z.string().min(1, "Name is required"),
    mobileNumber: z.string().regex(/^\+\d{10,15}$/, "Mobile number must be in international format (e.g. +91XXXXXXXXXX)"),
    email: z.string().email("Invalid email format").optional().or(z.literal("")),
    businessType: z.nativeEnum(BusinessType),
    status: z.nativeEnum(LeadStatus).optional(),
    notes: z.string().optional(),
    assignedTemplateId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid template ID").optional().or(z.literal("")),
});

export const updateLeadSchema = createLeadSchema.partial();
