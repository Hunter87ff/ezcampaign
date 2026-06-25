import type { Request, Response } from "express";
import twilio from "twilio";
const { twiml } = twilio;

export default class WebhookController {
    /**
     * Handle incoming WhatsApp reply.
     * @route POST /webhook/whatsapp/incoming
     * @access public
     */
    static async incomingWhatsApp(req: Request, res: Response) {
        try {
            if (!req.validator) {
                return res.status(500).send("Validator not initialized");
            }
            console.log("Incoming WhatsApp Webhook:", req.body)
            const validation = req.validator.webhook.incomingWhatsAppWebhookSchema.safeParse(req.body);
            if (!validation.success) {
                // Return valid empty TwiML anyway so Twilio doesn't retry
                const response = new twiml.MessagingResponse();
                res.type("text/xml");
                return res.send(response.toString());
            }

            const { From, Body, MessageSid } = validation.data;
            const mobileNumber = From.replace("whatsapp:", "").trim();

            // Find lead by mobileNumber
            const lead = await req.db.Lead.findOne({ mobileNumber, isDeleted: false });
            if (lead) {
                // Save MessageLog
                const messageLog = new req.db.MessageLog({
                    leadId: lead._id,
                    direction: "inbound",
                    body: Body,
                    twilioSid: MessageSid,
                    status: "delivered",
                    sentAt: new Date()
                });
                await messageLog.save();

                // Update lead status to responded
                lead.status = req.db.Lead.schema.path("status").enumValues.includes("responded")
                    ? ( "responded" as any )
                    : lead.status;
                await lead.save();

                // Log activity
                const activity = new req.db.ActivityLog({
                    leadId: lead._id,
                    action: "reply_received",
                    details: {
                        body: Body,
                        twilioSid: MessageSid
                    }
                });
                await activity.save();
            }

            // Always return TwiML Response
            const response = new twiml.MessagingResponse();
            res.type("text/xml");
            return res.send(response.toString());

        } catch (error) {
            // Keep Twilio happy on internal errors
            const response = new twiml.MessagingResponse();
            res.type("text/xml");
            return res.send(response.toString());
        }
    }

    /**
     * Handle WhatsApp message status updates.
     * @route POST /webhook/whatsapp/status
     * @access public
     */
    static async whatsappStatus(req: Request, res: Response) {
        try {
            if (!req.validator) {
                return res.status(500).send("Validator not initialized");
            }
            const validation = req.validator.webhook.whatsappStatusWebhookSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ error: validation.error.format() });
            }

            const { MessageSid, MessageStatus } = validation.data;
            console.log("WhatsApp Status Webhook:", req.body)

            // Map Twilio statuses to our schema statuses
            // our schema: queued | sent | delivered | read | failed
            let finalStatus: "queued" | "sent" | "delivered" | "read" | "failed" = "queued";
            if (["sent"].includes(MessageStatus)) finalStatus = "sent";
            else if (["delivered"].includes(MessageStatus)) finalStatus = "delivered";
            else if (["read"].includes(MessageStatus)) finalStatus = "read";
            else if (["failed", "undelivered"].includes(MessageStatus)) finalStatus = "failed";

            await req.db.MessageLog.findOneAndUpdate(
                { twilioSid: MessageSid },
                { status: finalStatus }
            );

            return res.status(200).send("OK");
        } catch (error: any) {
            return res.status(500).send("Webhook handler error");
        }
    }

    /**
     * Handle call status updates.
     * @route POST /webhook/call/status
     * @access public
     */
    static async callStatus(req: Request, res: Response) {
        try {
            if (!req.validator) {
                return res.status(500).send("Validator not initialized");
            }
            const validation = req.validator.webhook.callStatusWebhookSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ error: validation.error.format() });
            }

            const { CallSid, CallStatus, CallDuration } = validation.data;

            // Map Twilio CallStatus values
            // schema status: initiated | ringing | in-progress | completed | no-answer | busy | failed
            let finalStatus: "initiated" | "ringing" | "in-progress" | "completed" | "no-answer" | "busy" | "failed" = "initiated";
            if (["ringing"].includes(CallStatus)) finalStatus = "ringing";
            else if (["in-progress", "answered"].includes(CallStatus)) finalStatus = "in-progress";
            else if (["completed"].includes(CallStatus)) finalStatus = "completed";
            else if (["busy"].includes(CallStatus)) finalStatus = "busy";
            else if (["no-answer"].includes(CallStatus)) finalStatus = "no-answer";
            else if (["failed", "canceled"].includes(CallStatus)) finalStatus = "failed";

            const updateFields: any = { status: finalStatus };

            // If the call has ended, set endTime and duration
            const isEnded = ["completed", "busy", "no-answer", "failed", "canceled"].includes(CallStatus);
            if (isEnded) {
                updateFields.endTime = new Date();
                if (CallDuration !== undefined) {
                    updateFields.duration = CallDuration;
                }
            }

            await req.db.CallLog.findOneAndUpdate(
                { twilioCallSid: CallSid },
                updateFields
            );

            return res.status(200).send("OK");
        } catch (error) {
            return res.status(500).send("Webhook handler error");
        }
    }
}
