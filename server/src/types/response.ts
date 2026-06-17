import { type IActivityLog } from "@/models/log/activity"



export type Summary = {
    leads: {
        total: number,
        statusBreakdown: Record<string, number>,
        businessTypeBreakdown: Record<string, number>
    },
    messages: {
        outbound: number,
        inbound: number,
        total: number,
        trend: {
            date: string,
            count: number
        }[]
    },
    calls: {
        total: number
    },
    activeCampaigns: number,
    recentActivities: (IActivityLog | {
        leadId: string,
        name: string,
        mobileNumber: string,
        businessType: string
    })[]
}