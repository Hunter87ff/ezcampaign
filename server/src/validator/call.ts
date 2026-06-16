import { z } from "zod";

export const initiateCallSchema = z.object({
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid lead ID"),
    message: z.string().min(1, "Message content is required to say on the call"),
});
