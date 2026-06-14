import { z } from "zod";
import { BusinessType } from "@/enums";

export const createTemplateSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    templateSid: z.string().min(1, "Twilio Content SID is required"),
    businessType: z.nativeEnum(BusinessType),
    variables: z.array(z.string()).optional(),
    sampleBody: z.string().optional(),
    isActive: z.boolean().optional(),
});
