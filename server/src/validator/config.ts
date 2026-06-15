import { z } from "zod";

export const updateConfigSchema = z.object({
    accountSid: z.string().regex(/^AC[a-fA-F0-9]{32}$/, "Invalid Twilio Account SID format"),
    authToken: z.string().min(1, "Twilio Auth Token is required"),
    whatsappNum: z.string().regex(/^whatsapp:\+\d{10,15}$/, "WhatsApp number must be in format 'whatsapp:+91XXXXXXXXXX'"),
    phoneNum: z.string().regex(/^\+\d{10,15}$/, "Voice number must be in format '+91XXXXXXXXXX'"),
    templateSid: z.string().regex(/^HX[a-fA-F0-9]{32}$/, "Invalid Twilio Content Template SID format"),
    baseUrl: z.string().url("Invalid Ngrok Webhook Base URL format"),
});
