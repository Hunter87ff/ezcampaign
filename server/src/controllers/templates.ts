import type { Request, Response } from "express";

export default class TemplateController {
    /**
     * Get templates, optionally filtered by businessType.
     * @route GET /api/templates
     * @access private
     */
    static async list(req: Request, res: Response) {
        try {
            const { businessType } = req.query;
            const filterQuery: any = { isActive: true };

            if (businessType) {
                filterQuery.businessType = businessType;
            }

            const templates = await req.db.Template.find(filterQuery).sort({ createdAt: -1 });
            return res.handler.success(res, "Templates retrieved successfully", templates);
        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to retrieve templates", { error });
        }
    }

    /**
     * Create a new WhatsApp template.
     * @route POST /api/templates
     * @access private
     */
    static async create(req: Request, res: Response) {
        try {
            if (!req.validator) {
                return res.handler.error(res, "Validator middleware not initialized");
            }
            const validation = req.validator.template.createTemplateSchema.safeParse(req.body);
            if (!validation.success) {
                return res.handler.badRequest(res, "Validation Error", validation.error.format());
            }

            const { name, templateSid, businessType, variables, sampleBody, isActive } = validation.data;

            // Check if templateSid already exists
            const existingTemplate = await req.db.Template.findOne({ templateSid });
            if (existingTemplate) {
                return res.handler.conflict(res, "Template with this Twilio Content SID already exists");
            }

            const template = new req.db.Template({
                name,
                templateSid,
                businessType,
                variables,
                sampleBody,
                isActive
            });

            await template.save();
            return res.handler.created(res, "Template created successfully", template);
        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to create template", { error });
        }
    }

    /**
     * Delete a template.
     * @route DELETE /api/templates/:id
     * @access private
     */
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const template = await req.db.Template.findByIdAndDelete(id);
            if (!template) {
                return res.handler.notFound(res, "Template not found");
            }
            return res.handler.success(res, "Template deleted successfully", { id });
        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to delete template", { error });
        }
    }
}
