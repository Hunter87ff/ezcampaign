import { z } from "zod";

export const sendMessageSchema = z.object({
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid lead ID"),
    templateId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid template ID"),
    variables: z.record(z.string(), z.string()).optional(),
});
