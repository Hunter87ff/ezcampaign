import type { Request, Response } from "express";
import { UserToken } from "@/utils/wrappers/usertoken";
import { Role } from "@/enums";

export default class AuthController {
    /**
     * Authenticate user & return JWT token
     * @route POST /api/auth/login
     * @access public
     */
    static async login(req: Request, res: Response) {
        try {
            // Seed admin if no user exists
            const userCount = await req.db.User.countDocuments({});
            if (userCount === 0) {
                const seedAdmin = new req.db.User({
                    name: "Default Admin",
                    email: "admin@company.com",
                    passwordHash: "Admin@123", // Automatic hashing via user.ts pre-save hook
                    role: Role.ADMIN
                });
                await seedAdmin.save();
            }

            // Input Validation
            if (!req.validator) {
                return res.handler.error(res, "Validator middleware not initialized");
            }
            const validation = req.validator.auth.loginSchema.safeParse(req.body);
            if (!validation.success) {
                return res.handler.badRequest(res, "Validation Error", validation.error.format());
            }

            const { email, password } = validation.data;

            // Find user
            const user = await req.db.User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.handler.unAuthorized(res, "Invalid email or password");
            }

            // Verify password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.handler.unAuthorized(res, "Invalid email or password");
            }

            // Generate token
            const userToken = new UserToken({
                id: user._id.toString(),
                name: user.name,
                role: user.role
            });

            const token = userToken.getToken();

            // Set cookie
            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });

            return res.handler.success(res, "Login successful", {
                token,
                admin: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error: any) {
            return res.handler.error(res, error.message || "An error occurred during login", { error });
        }
    }
}
