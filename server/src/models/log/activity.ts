import mongoose, { Schema, Document, Types } from "mongoose";

export interface IActivityLog extends Document {
    leadId?: Types.ObjectId;
    action: "message_sent" | "call_initiated" | "lead_created" | "reply_received" | string;
    details?: Record<string, any>;
    createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
    {
        leadId: {
            type: Schema.Types.ObjectId,
            ref: "Lead"
        },
        action: {
            type: String,
            required: true,
            enum: ["message_sent", "call_initiated", "lead_created", "reply_received"],
            trim: true
        },
        details: {
            type: Schema.Types.Mixed,
            default: {}
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

// Indexes for query performance
ActivityLogSchema.index({ leadId: 1 });
ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
export default ActivityLog;
