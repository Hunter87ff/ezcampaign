import type { Request, Response } from "express";

export default class LeadController {
    /**
     * Get all active leads with optional filtering, search, and pagination.
     * @route GET /api/leads
     * @access private
     */
    static async list(req: Request, res: Response) {
        try {
            const { businessType, status, search, page = 1, limit = 10 } = req.query;

            const filterQuery: any = { isDeleted: false };

            if (businessType) {
                filterQuery.businessType = businessType;
            }

            if (status) {
                filterQuery.status = status;
            }

            if (search) {
                const searchRegex = new RegExp(String(search), "i");
                filterQuery.$or = [
                    { name: searchRegex },
                    { mobileNumber: searchRegex },
                    { email: searchRegex }
                ];
            }

            const pageNum = Math.max(1, Number(page));
            const limitNum = Math.max(1, Number(limit));
            const skip = (pageNum - 1) * limitNum;

            const total = await req.db.Lead.countDocuments(filterQuery);
            const leads = await req.db.Lead.find(filterQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum);

            return res.handler.success(res, "Leads retrieved successfully", {
                leads,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum)
                }
            });
        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to retrieve leads", { error });
        }
    }

    /**
     * Create a new lead.
     * @route POST /api/leads
     * @access private
     */
    static async create(req: Request, res: Response) {
        try {
            if (!req.validator) {
                return res.handler.error(res, "Validator middleware not initialized");
            }
            const validation = req.validator.lead.createLeadSchema.safeParse(req.body);
            if (!validation.success) {
                return res.handler.badRequest(res, "Validation Error", validation.error.format());
            }

            const { name, mobileNumber, email, businessType, status, notes, assignedTemplateId } = validation.data;

            // Check uniqueness of mobileNumber
            const existingLead = await req.db.Lead.findOne({ mobileNumber, isDeleted: false });
            if (existingLead) {
                return res.handler.conflict(res, "Lead with this mobile number already exists");
            }

            const lead = new req.db.Lead({
                name,
                mobileNumber,
                email,
                businessType,
                status,
                notes,
                assignedTemplateId
            });

            await lead.save();

            // Log activity
            const activity = new req.db.ActivityLog({
                leadId: lead._id,
                action: "lead_created",
                details: {
                    name: lead.name,
                    businessType: lead.businessType,
                    status: lead.status
                }
            });
            await activity.save();

            return res.handler.created(res, "Lead created successfully", lead);
        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to create lead", { error });
        }
    }

    /**
     * Get details of a single lead.
     * @route GET /api/leads/:id
     * @access private
     */
    static async get(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const lead = await req.db.Lead.findOne({ _id: id, isDeleted: false });
            if (!lead) {
                return res.handler.notFound(res, "Lead not found");
            }
            return res.handler.success(res, "Lead details retrieved", lead);
        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to retrieve lead details", { error });
        }
    }

    /**
     * Update an existing lead.
     * @route PUT /api/leads/:id
     * @access private
     */
    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!req.validator) {
                return res.handler.error(res, "Validator middleware not initialized");
            }
            const validation = req.validator.lead.updateLeadSchema.safeParse(req.body);
            if (!validation.success) {
                return res.handler.badRequest(res, "Validation Error", validation.error.format());
            }

            const updateData = validation.data;

            // Retrieve lead
            const lead = await req.db.Lead.findOne({ _id: id, isDeleted: false });
            if (!lead) {
                return res.handler.notFound(res, "Lead not found");
            }

            // Check if mobileNumber uniqueness is violated
            if (updateData.mobileNumber && updateData.mobileNumber !== lead.mobileNumber) {
                const existingLead = await req.db.Lead.findOne({
                    mobileNumber: updateData.mobileNumber,
                    isDeleted: false,
                    _id: { $ne: id }
                });
                if (existingLead) {
                    return res.handler.conflict(res, "Another lead with this mobile number already exists");
                }
            }

            // Update fields
            Object.assign(lead, updateData);
            await lead.save();

            return res.handler.success(res, "Lead updated successfully", lead);
        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to update lead", { error });
        }
    }

    /**
     * Soft delete a lead.
     * @route DELETE /api/leads/:id
     * @access private
     */
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const lead = await req.db.Lead.findOne({ _id: id, isDeleted: false });
            if (!lead) {
                return res.handler.notFound(res, "Lead not found");
            }

            lead.isDeleted = true;
            await lead.save();

            return res.handler.success(res, "Lead deleted successfully", { id });
        } catch (error: any) {
            return res.handler.error(res, error.message || "Failed to delete lead", { error });
        }
    }
}
