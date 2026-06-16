import type { Request, Response } from "express";
import twilio from "twilio";
import config from "@/config";

export default class MessageController {
    /**
     * Send WhatsApp template to lead via Twilio.
     * @route POST /api/messages/send
     * @access private
     */
    static async send(req: Request, res: Response) {
        try {
            if (!req.validator) {
                return res.handler.error(res, "Validator middleware not initialized");
            }
            const validation = req.validator.message.sendMessageSchema.safeParse(req.body);
            if (!validation.success) {
                return res.handler.badRequest(res, "Validation Error", validation.error.format());
            }

            const { leadId, templateId, body, variables } = validation.data;

            // Fetch lead
            const lead = await req.db.Lead.findOne({ _id: leadId, isDeleted: false });
            if (!lead) {
                return res.handler.notFound(res, "Lead not found");
            }

            // Instantiate Twilio client
            if (!config.twilio.sid || !config.twilio.auth_token) {
                return res.handler.error(res, "Twilio configuration credentials missing on server");
            }
            const client = twilio(config.twilio.sid, config.twilio.auth_token);

            let bodyText = "";
            let twilioSid = "";
            let status = "queued";
            let templateSid: string | undefined = undefined;

            if (templateId) {
                // Fetch template
                const template = await req.db.Template.findById(templateId);
                if (!template) {
                    return res.handler.notFound(res, "Template not found");
                }

                // Verify template matches lead's business type
                if (template.businessType !== lead.businessType) {
                    return res.handler.badRequest(res, `Template business type '${template.businessType}' does not match lead business type '${lead.businessType}'`);
                }

                templateSid = template.templateSid;

                // Map template variables from named object to Twilio 1-based index (e.g. name -> 1)
                const twilioVariables: Record<string, string> = {};
                if (variables) {
                    const hasNumericKeys = Object.keys(variables).some(key => /^\d+$/.test(key));
                    if (hasNumericKeys) {
                        Object.assign(twilioVariables, variables);
                    } else if (template.variables && template.variables.length > 0) {
                        template.variables.forEach((varName, idx) => {
                            const val = variables[varName];
                            if (val !== undefined) {
                                twilioVariables[String(idx + 1)] = val;
                            }
                        });
                    } else {
                        Object.assign(twilioVariables, variables);
                    }
                }

                // Reconstruct message body for database logging
                bodyText = template.sampleBody || `Template: ${template.name}`;
                if (variables) {
                    for (const [key, val] of Object.entries(variables)) {
                        bodyText = bodyText.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
                    }
                    for (const [key, val] of Object.entries(twilioVariables)) {
                        bodyText = bodyText.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
                    }
                }

                // Send via Twilio
                try {
                    const message = await client.messages.create({
                        contentSid: template.templateSid,
                        from: config.twilio.wp_number,
                        to: `whatsapp:${lead.mobileNumber}`,
                        contentVariables: JSON.stringify(twilioVariables)
                    });
                    twilioSid = message.sid;
                    status = message.status;
                } catch (twilioError: any) {
                    res.logger.error("Twilio send failed:", twilioError);
                    return res.handler.badRequest(res, `Twilio delivery failed: ${twilioError.message}`, twilioError);
                }
            } else if (body) {
                bodyText = body;
                // Send free text via Twilio
                try {
                    const message = await client.messages.create({
                        from: config.twilio.wp_number || "whatsapp:+916291745601",
                        to: `whatsapp:${lead.mobileNumber}`,
                        body: bodyText
                    });
                    twilioSid = message.sid;
                    status = message.status;
                } catch (twilioError: any) {
                    res.logger.error("Twilio send failed:", twilioError);
                    return res.handler.badRequest(res, `Twilio delivery failed: ${twilioError.message}`, twilioError);
                }
            } else {
                return res.handler.badRequest(res, "Either templateId or body is required");
            }

            // Save MessageLog
            const messageLog = new req.db.MessageLog({
                leadId: lead._id,
                direction: "outbound",
                templateSid: templateSid,
                body: bodyText,
                twilioSid: twilioSid,
                status: status === "queued" ? "queued" : (status as any),
                sentAt: new Date()
            });
            await messageLog.save();

            // Update Lead status to contacted
            lead.status = req.db.Lead.schema.path("status").enumValues.includes("contacted")
                ? ("contacted" as any)
                : lead.status;
            await lead.save();

            // Log Activity
            const activity = new req.db.ActivityLog({
                leadId: lead._id,
                action: "message_sent",
                details: {
                    twilioSid: twilioSid,
                    templateSid: templateSid,
                    status: status,
                    body: bodyText
                }
            });
            await activity.save();

            return res.handler.success(res, "Message sent successfully", messageLog);

        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to send message", { error });
        }
    }

    /**
     * Get conversation history for a lead.
     * @route GET /api/messages/:leadId
     * @access private
     */
    static async history(req: Request, res: Response) {
        try {
            const { leadId } = req.params;
            const { page = 1, limit = 50 } = req.query;

            const pageNum = Math.max(1, Number(page));
            const limitNum = Math.max(1, Number(limit));
            const skip = (pageNum - 1) * limitNum;

            // Check if lead exists
            const lead = await req.db.Lead.findOne({ _id: leadId, isDeleted: false });
            if (!lead) {
                return res.handler.notFound(res, "Lead not found");
            }

            const total = await req.db.MessageLog.countDocuments({ leadId });
            const messages = await req.db.MessageLog.find({ leadId })
                .sort({ sentAt: -1 })
                .skip(skip)
                .limit(limitNum);

            return res.handler.success(res, "Message history retrieved", {
                messages,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum)
                }
            });

        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to retrieve history", { error });
        }
    }
}
