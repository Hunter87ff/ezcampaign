import mongoose, { Schema, Document } from "mongoose";
import { BusinessType } from "@/enums";

export interface ITemplate extends Document {
    name: string;
    templateSid: string;
    businessType: BusinessType;
    variables?: string[];
    sampleBody?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        templateSid: {
            type: String,
            required: true,
            trim: true
        },
        businessType: {
            type: String,
            enum: Object.values(BusinessType),
            required: true
        },
        variables: {
            type: [String],
            default: []
        },
        sampleBody: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            required: true,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export const Template = mongoose.model<ITemplate>("Template", TemplateSchema);
export default Template;
