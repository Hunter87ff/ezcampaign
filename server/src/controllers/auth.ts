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

    /**
     * Update current user's profile info (name, email, optionally password)
     * @route PUT /api/auth/profile
     * @access private
     */
    static async updateProfile(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.handler.unAuthorized(res, "Unauthorized");
            }

            if (!req.validator) {
                return res.handler.error(res, "Validator middleware not initialized");
            }

            const validation = req.validator.auth.updateProfileSchema.safeParse(req.body);
            if (!validation.success) {
                return res.handler.badRequest(res, "Validation Error", validation.error.format());
            }

            const { name, email, password } = validation.data;

            // Find current user
            const user = await req.db.User.findById(req.user.id);
            if (!user) {
                return res.handler.notFound(res, "User not found");
            }

            // If email is changing, check uniqueness
            if (email.toLowerCase() !== user.email) {
                const emailExists = await req.db.User.findOne({ email: email.toLowerCase() });
                if (emailExists) {
                    return res.handler.badRequest(res, "Email already in use");
                }
                user.email = email.toLowerCase();
            }

            user.name = name;

            if (password && password.trim() !== "") {
                user.passwordHash = password; // hashed automatically on save
            }

            await user.save();

            // Regenerate token
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

            return res.handler.success(res, "Profile updated successfully", {
                token,
                admin: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error: any) {
            return res.handler.error(res, error.message || "An error occurred during profile update", { error });
        }
    }

    /**
     * Create a new user account (admin only)
     * @route POST /api/auth/register
     * @access private (admin only)
     */
    static async register(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.handler.unAuthorized(res, "Unauthorized");
            }

            // Restrict user registration to admins only
            if (req.user.role && !req.user.role.admin) {
                return res.handler.forbidden(res, "Access denied. Admins only.");
            }

            if (!req.validator) {
                return res.handler.error(res, "Validator middleware not initialized");
            }

            const validation = req.validator.auth.registerSchema.safeParse(req.body);
            if (!validation.success) {
                return res.handler.badRequest(res, "Validation Error", validation.error.format());
            }

            const { name, email, password, role } = validation.data;

            // Check if user exists
            const existingUser = await req.db.User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.handler.badRequest(res, "Email already registered");
            }

            // Create new user
            const newUser = new req.db.User({
                name,
                email: email.toLowerCase(),
                passwordHash: password, // hashed automatically on save
                role: role as Role
            });

            await newUser.save();

            return res.handler.success(res, "User registered successfully", {
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            });

        } catch (error: any) {
            return res.handler.error(res, error.message || "An error occurred during registration", { error });
        }
    }
}
