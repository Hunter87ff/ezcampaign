import { z } from "zod";

export const sendMessageSchema = z.object({
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid lead ID"),
    templateId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid template ID").optional(),
    body: z.string().optional(),
    variables: z.record(z.string(), z.string()).optional(),
}).refine((data) => data.templateId || data.body, {
    message: "Either templateId or body is required",
    path: ["templateId", "body"],
});
