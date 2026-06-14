import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessageLog extends Document {
    leadId: Types.ObjectId;
    direction: "outbound" | "inbound";
    templateSid?: string;
    body: string;
    twilioSid: string;
    status: "queued" | "sent" | "delivered" | "read" | "failed";
    sentAt: Date;
}

const MessageLogSchema = new Schema<IMessageLog>(
    {
        leadId: {
            type: Schema.Types.ObjectId,
            ref: "Lead",
            required: true
        },
        direction: {
            type: String,
            enum: ["outbound", "inbound"],
            required: true
        },
        templateSid: {
            type: String,
            trim: true
        },
        body: {
            type: String,
            required: true,
            trim: true
        },
        twilioSid: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["queued", "sent", "delivered", "read", "failed"],
            required: true
        },
        sentAt: {
            type: Date,
            required: true,
            default: Date.now
        }
    },
    {
        timestamps: false
    }
);

// Indexing for quick lookups on twilioSid and leadId
MessageLogSchema.index({ twilioSid: 1 });
MessageLogSchema.index({ leadId: 1, sentAt: -1 });

export const MessageLog = mongoose.model<IMessageLog>("MessageLog", MessageLogSchema);
export default MessageLog;
