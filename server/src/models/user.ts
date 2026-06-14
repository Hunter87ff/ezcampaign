import mongoose, { Schema, Document } from "mongoose";
import { Role } from "@/enums";
import Helper from "@/utils/helper";

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    createdAt: Date;
    comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: Object.values(Role),
            required: true,
            default: Role.ADMIN
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

// Pre-save hook for hashing the password if it's updated/created
UserSchema.pre<IUser>("save", async function () {
    if (this.isModified("passwordHash")) {
        const isBcrypt = /^\$2[aby]\$\d\d\$.{53}$/.test(this.passwordHash);
        if (!isBcrypt) {
            this.passwordHash = await Helper.hashPassword(this.passwordHash);
        }
    }
});

// Instance method for password comparison
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return Helper.comparePassword(password, this.passwordHash);
};

export const User = mongoose.model<IUser>("User", UserSchema);
export default User;
