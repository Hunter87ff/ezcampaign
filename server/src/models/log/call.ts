import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICallLog extends Document {
    leadId: Types.ObjectId;
    phoneNumber: string;
    twilioCallSid: string;
    status: "initiated" | "ringing" | "in-progress" | "completed" | "no-answer" | "busy" | "failed";
    startTime: Date;
    endTime?: Date;
    duration?: number;
}

const CallLogSchema = new Schema<ICallLog>(
    {
        leadId: {
            type: Schema.Types.ObjectId,
            ref: "Lead",
            required: true
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true
        },
        twilioCallSid: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["initiated", "ringing", "in-progress", "completed", "no-answer", "busy", "failed"],
            required: true
        },
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date
        },
        duration: {
            type: Number
        }
    },
    {
        timestamps: false
    }
);

// Indexes for looking up Twilio call SIDs and filter by lead
CallLogSchema.index({ twilioCallSid: 1 });
CallLogSchema.index({ leadId: 1 });

export const CallLog = mongoose.model<ICallLog>("CallLog", CallLogSchema);
export default CallLog;
