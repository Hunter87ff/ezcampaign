import type { _QueryFilter } from "mongoose";


export interface CallFilter extends _QueryFilter<any> {
    leadId?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export type CallStatus = "initiated" | "ringing" | "in_progress" | "completed";
export type CallEvents = "initiated" | "ringing" | "answered" | "completed";


