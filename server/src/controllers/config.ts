import type { Request, Response } from "express";
import config from "@/config";

export default class ConfigController {
    /**
     * Get system configuration (Twilio details and ngrok base URL).
     * @route GET /api/config
     * @access private (Admin Only)
     */
    static async getConfig(req: Request, res: Response) {
        try {
            // Only allow admin roles
            if (req.user && !req.user.role.admin) {
                return res.handler.adminOnly(res, "Access Denied: Admin role required");
            }

            const data = {
                accountSid: config.twilio.sid,
                authToken: config.twilio.auth_token,
                whatsappNum: config.twilio.wp_number,
                phoneNum: (config.twilio as any).phone_number || process.env.TWILIO_PHONE_NUMBER || config.twilio.wp_number?.replace("whatsapp:", "") || "+916291745601",
                templateSid: (config.twilio as any).template_sid || process.env.TWILIO_TEMPLATE_SID || "HXdc1311d3869ec9e14c9ced8023d7e3e7",
                baseUrl: (config.twilio as any).baseUrl || process.env.TWILIO_HOOK_ENDPOINT || process.env.BASE_URL || config.endpoint || "http://localhost:8000"
            };

            return res.handler.success(res, "Configuration retrieved successfully", data);
        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to retrieve configuration", { error });
        }
    }

    /**
     * Update system configuration in memory.
     * @route PUT /api/config
     * @access private (Admin Only)
     */
    static async updateConfig(req: Request, res: Response) {
        try {
            // Only allow admin roles
            if (req.user && !req.user.role.admin) {
                return res.handler.adminOnly(res, "Access Denied: Admin role required");
            }

            if (!req.validator) {
                return res.handler.error(res, "Validator middleware not initialized");
            }

            const validation = req.validator.config.updateConfigSchema.safeParse(req.body);
            if (!validation.success) {
                return res.handler.badRequest(res, "Validation Error", validation.error.format());
            }

            const { accountSid, authToken, whatsappNum, phoneNum, templateSid, baseUrl } = validation.data;

            // Update global config in-memory
            config.twilio.sid = accountSid;
            config.twilio.auth_token = authToken;
            config.twilio.wp_number = whatsappNum;
            config.twilio.ph_number = phoneNum;
            (config.twilio as any).phone_number = phoneNum;
            (config.twilio as any).template_sid = templateSid;
            (config.twilio as any).baseUrl = baseUrl;

            // Synchronize process.env for other parts of the application checking env directly
            process.env.TWILIO_ACCOUNT_SID = accountSid;
            process.env.TWILIO_AUTH_TOKEN = authToken;
            process.env.TWILIO_FROM = whatsappNum;
            process.env.TWILIO_PHONE_NUMBER = phoneNum;
            process.env.TWILIO_TEMPLATE_SID = templateSid;
            process.env.BASE_URL = baseUrl;
            process.env.TWILIO_HOOK_ENDPOINT = baseUrl;

            res.logger.info("Server Twilio credentials and webhook configurations updated dynamically in-memory");

            const updatedData = {
                accountSid: config.twilio.sid,
                authToken: config.twilio.auth_token,
                whatsappNum: config.twilio.wp_number,
                phoneNum: (config.twilio as any).phone_number,
                templateSid: (config.twilio as any).template_sid,
                baseUrl: (config.twilio as any).baseUrl
            };

            return res.handler.success(res, "Configuration updated successfully", updatedData);
        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to update configuration", { error });
        }
    }
}
