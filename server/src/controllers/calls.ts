import type { Request, Response } from "express";
import twilio from "twilio";
import config from "@/config";
import { type CallFilter } from "@/types";

export default class CallController {
    /**
     * Initiate Twilio voice call to lead.
     * @route POST /api/calls/initiate
     * @access private
     */
    static async initiate(req: Request, res: Response) {
        try {
            if (!req.validator) {
                return res.handler.error(res, "Validator middleware not initialized");
            }
            const validation = req.validator.call.initiateCallSchema.safeParse(req.body);
            if (!validation.success) {
                return res.handler.badRequest(res, "Validation Error", validation.error.format());
            }

            const { leadId, message } = validation.data;

            // Fetch lead
            const lead = await req.db.Lead.findOne({ _id: leadId, isDeleted: false });
            if (!lead) {
                return res.handler.notFound(res, "Lead not found");
            }

            // Verify Twilio config
            if (!config.twilio.sid || !config.twilio.auth_token) {
                return res.handler.error(res, "Twilio configuration credentials missing on server");
            }

            const client = twilio(config.twilio.sid, config.twilio.auth_token);

            // Determine callback BASE_URL
            const baseUrl = config.twilio.hook_endpoint;

            const twimlMessage = `
                <Response>
                    <Say voice="alice">${message}</Say>
                </Response>
            `;

            // Make Twilio Voice Call
            let call;
            try {
                call = await client.calls.create({
                    to: lead.mobileNumber,
                    from: config.twilio.ph_number,
                    twiml: twimlMessage,
                    statusCallback: `${baseUrl}/webhook/call/status`,
                    statusCallbackEvent: ["initiated", "ringing", "answered", "completed"]
                });
            } catch (twilioError: any) {
                res.logger.error("Twilio Voice Call failed:", twilioError);
                return res.handler.badRequest(res, `Twilio call failed: ${twilioError.message}`, twilioError);
            }

            // Save CallLog
            const callLog = new req.db.CallLog({
                leadId: lead._id,
                phoneNumber: lead.mobileNumber,
                twilioCallSid: call.sid,
                status: "initiated",
                startTime: new Date()
            });
            await callLog.save();

            // Log Activity
            const activity = new req.db.ActivityLog({
                leadId: lead._id,
                action: "call_initiated",
                details: {
                    twilioCallSid: call.sid,
                    status: call.status
                }
            });
            await activity.save();

            return res.handler.success(res, "Voice call initiated successfully", callLog);

        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to initiate call", { error });
        }
    }

    /**
     * Get all call logs with filtering and pagination.
     * @route GET /api/calls
     * @access private
     */
    static async list(req: Request, res: Response) {
        try {
            const { leadId, status, page = 1, limit = 10 } = req.query as CallFilter;
            const filterQuery: CallFilter = {};

            if (leadId) {
                filterQuery.leadId = leadId;
            }

            if (status) {
                filterQuery.status = status;
            }

            const pageNum = Math.max(1, Number(page));
            const limitNum = Math.max(1, Number(limit));
            const skip = (pageNum - 1) * limitNum;

            const total = await req.db.CallLog.countDocuments(filterQuery as any);
            const calls = await req.db.CallLog.find(filterQuery as any)
                .sort({ startTime: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate("leadId", "name mobileNumber businessType");

            return res.handler.success(res, "Call logs retrieved", {
                calls,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum)
                }
            });

        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to retrieve call logs", { error });
        }
    }

    /**
     * Delete a call log by ID.
     * @route DELETE /api/calls/:id
     * @access private
     */
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const call = await req.db.CallLog.findByIdAndDelete(id);
            if (!call) {
                return res.handler.notFound(res, "Call log not found");
            }
            return res.handler.success(res, "Call log deleted successfully", { id });
        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to delete call log", { error });
        }
    }
}
