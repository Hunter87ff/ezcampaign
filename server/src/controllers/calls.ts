import type { Request, Response } from "express";
import twilio from "twilio";
import config from "@/config";

export default class CallController {
    /**
     * Initiate Twilio voice call to lead.
     * @route POST /api/calls/initiate
     * @access private
     */
    static async initiate(req: Request, res: Response) {
        return res.handler.badRequest(res, "Voice calling is disabled");
    }

    /**
     * Get all call logs with filtering and pagination.
     * @route GET /api/calls
     * @access private
     */
    static async list(req: Request, res: Response) {
        try {
            const { leadId, status, page = 1, limit = 10 } = req.query;
            const filterQuery: any = {};

            if (leadId) {
                filterQuery.leadId = leadId;
            }

            if (status) {
                filterQuery.status = status;
            }

            const pageNum = Math.max(1, Number(page));
            const limitNum = Math.max(1, Number(limit));
            const skip = (pageNum - 1) * limitNum;

            const total = await req.db.CallLog.countDocuments(filterQuery);
            const calls = await req.db.CallLog.find(filterQuery)
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
}
