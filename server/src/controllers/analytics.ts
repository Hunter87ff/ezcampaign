import cache from "@/utils/cache";
import { type Summary } from "@/types/response";
import type { Request, Response } from "express";

export default class AnalyticsController {
    static summaryCache = new cache<Summary>(null, 1 * 60 * 1000);



    /**
     * Get dashboard summary statistics, counts, and breakdown.
     * @route GET /api/analytics/summary
     * @access private
     */
    static async summary(req: Request, res: Response) {
        try {
            const cachedSummary = AnalyticsController.summaryCache.get();
            if (cachedSummary) {
                res.set("Cache-ExpireAt", AnalyticsController.summaryCache.exp.toISOString());
                return res.handler.success(res, "Dashboard analytics retrieved successfully", cachedSummary);
            }
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
            const outboundMessages = await req.db.MessageLog.countDocuments({ 
                direction: "outbound" 
            });
            
            const inboundMessages = await req.db.MessageLog.countDocuments({ 
                direction: "inbound" 
            });
            
            // 5. Voice Call counts
            const totalCalls = await req.db.CallLog.countDocuments({});

            // 6. Recent Activity Feed (latest 10)
            const recentActivities = await req.db.ActivityLog.find({})
                .sort({ createdAt: -1 })
                .limit(10)
                .populate("leadId", "name mobileNumber businessType");

            // 7. Active Campaigns (Templates) count
            const activeCampaigns = await req.db.Template.countDocuments({ isActive: true });

            // 8. Messages per day trend (last 30 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30);
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

            const summary : Summary = {
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
                activeCampaigns,
                recentActivities
            }

            
            AnalyticsController.summaryCache.set(summary);

            return res.handler.success(
                res, 
                "Dashboard analytics retrieved successfully", 
                summary
            );

        } catch (error: any) {
            return res.handler.error(
                res, 
                error.message || "Failed to retrieve dashboard analytics", 
                { error }
            );
        }
    }
}
