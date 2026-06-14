import mongoose, { Schema, Document, Types } from "mongoose";
import { BusinessType, LeadStatus } from "@/enums";

export interface ILead extends Document {
    name: string;
    mobileNumber: string;
    email?: string;
    businessType: BusinessType;
    status: LeadStatus;
    notes?: string;
    assignedTemplateId?: Types.ObjectId;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        mobileNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            lowercase: true,
            trim: true
        },
        businessType: {
            type: String,
            enum: Object.values(BusinessType),
            required: true
        },
        status: {
            type: String,
            enum: Object.values(LeadStatus),
            required: true,
            default: LeadStatus.NEW
        },
        notes: {
            type: String
        },
        assignedTemplateId: {
            type: Schema.Types.ObjectId,
            ref: "Template"
        },
        isDeleted: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Add index on mobileNumber for fast queries since they must be unique and are used in webhooks
LeadSchema.index({ mobileNumber: 1 });

export const Lead = mongoose.model<ILead>("Lead", LeadSchema);
export default Lead;
