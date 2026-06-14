import type { Request, Response } from "express";

export default class AnalyticsController {
    /**
     * Get dashboard summary statistics, counts, and breakdown.
     * @route GET /api/analytics/summary
     * @access private
     */
    static async summary(req: Request, res: Response) {
        try {
            // 1. Total Leads
            const totalLeads = await req.db.Lead.countDocuments({ isDeleted: false });

            // 2. Lead Status breakdown
            const statusBreakdown = await req.db.Lead.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]);
            const statusMap = statusBreakdown.reduce((acc: any, curr: any) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {});

            // 3. Lead Business Type breakdown
            const businessBreakdown = await req.db.Lead.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: "$businessType", count: { $sum: 1 } } }
            ]);
            const businessMap = businessBreakdown.reduce((acc: any, curr: any) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {});

            // 4. Message counts (inbound vs outbound)
            const outboundMessages = await req.db.MessageLog.countDocuments({ direction: "outbound" });
            const inboundMessages = await req.db.MessageLog.countDocuments({ direction: "inbound" });

            // 5. Voice Call counts
            const totalCalls = await req.db.CallLog.countDocuments({});

            // 6. Recent Activity Feed (latest 10)
            const recentActivities = await req.db.ActivityLog.find({})
                .sort({ createdAt: -1 })
                .limit(10)
                .populate("leadId", "name mobileNumber businessType");

            // 7. Messages per day trend (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const messagesTrend = await req.db.MessageLog.aggregate([
                { $match: { sentAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$sentAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            return res.handler.success(res, "Dashboard analytics retrieved successfully", {
                leads: {
                    total: totalLeads,
                    statusBreakdown: statusMap,
                    businessTypeBreakdown: businessMap
                },
                messages: {
                    outbound: outboundMessages,
                    inbound: inboundMessages,
                    total: outboundMessages + inboundMessages,
                    trend: messagesTrend
                },
                calls: {
                    total: totalCalls
                },
                recentActivities
            });

        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to retrieve dashboard analytics", { error });
        }
    }
}
