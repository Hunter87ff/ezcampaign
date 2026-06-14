import { z } from "zod";

export const incomingWhatsAppWebhookSchema = z.object({
    From: z.string().min(1, "From number is required"),
    Body: z.string().min(1, "Body is required"),
    MessageSid: z.string().min(1, "MessageSid is required"),
    To: z.string().min(1, "To number is required"),
});

export const whatsappStatusWebhookSchema = z.object({
    MessageSid: z.string().min(1, "MessageSid is required"),
    MessageStatus: z.string().min(1, "MessageStatus is required"),
});

export const callStatusWebhookSchema = z.object({
    CallSid: z.string().min(1, "CallSid is required"),
    CallStatus: z.string().min(1, "CallStatus is required"),
    CallDuration: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
});
