export const components = {
    schemas: {
        Lead: {
            type: "object",
            properties: {
                _id: { type: "string", example: "6650f1a2b3c4d5e6f7a8b9c0" },
                name: { type: "string", example: "John Doe" },
                mobileNumber: { type: "string", example: "+919876543210" },
                email: { type: "string", format: "email", example: "john@example.com" },
                businessType: {
                    type: "string",
                    enum: ["real_estate", "healthcare", "education", "ecommerce", "finance", "restaurant", "travel", "other"],
                    example: "real_estate"
                },
                status: {
                    type: "string",
                    enum: ["new", "contacted", "responded", "converted", "closed"],
                    example: "new"
                },
                notes: { type: "string", example: "Interested in premium package" },
                assignedTemplateId: { type: "string", example: "6650f1a2b3c4d5e6f7a8b9c0" },
                isDeleted: { type: "boolean", example: false },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" }
            }
        },
        Template: {
            type: "object",
            properties: {
                _id: { type: "string", example: "6650f1a2b3c4d5e6f7a8b9c0" },
                name: { type: "string", example: "Welcome Message" },
                templateSid: { type: "string", example: "HX1234567890abcdef" },
                businessType: {
                    type: "string",
                    enum: ["real_estate", "healthcare", "education", "ecommerce", "finance", "restaurant", "travel", "other"],
                    example: "real_estate"
                },
                variables: { type: "array", items: { type: "string" }, example: ["name", "company"] },
                sampleBody: { type: "string", example: "Hello {{name}}, welcome to {{company}}!" },
                isActive: { type: "boolean", example: true },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" }
            }
        },
        MessageLog: {
            type: "object",
            properties: {
                _id: { type: "string", example: "6650f1a2b3c4d5e6f7a8b9c0" },
                leadId: { type: "string", example: "6650f1a2b3c4d5e6f7a8b9c0" },
                direction: { type: "string", enum: ["outbound", "inbound"], example: "outbound" },
                templateSid: { type: "string", example: "HX1234567890abcdef" },
                body: { type: "string", example: "Hello John, welcome to EzCampaign!" },
                twilioSid: { type: "string", example: "SM1234567890abcdef" },
                status: { type: "string", enum: ["queued", "sent", "delivered", "read", "failed"], example: "queued" },
                sentAt: { type: "string", format: "date-time" }
            }
        },
        CallLog: {
            type: "object",
            properties: {
                _id: { type: "string", example: "6650f1a2b3c4d5e6f7a8b9c0" },
                leadId: { type: "string", example: "6650f1a2b3c4d5e6f7a8b9c0" },
                phoneNumber: { type: "string", example: "+919876543210" },
                twilioCallSid: { type: "string", example: "CA1234567890abcdef" },
                status: {
                    type: "string",
                    enum: ["initiated", "ringing", "in-progress", "completed", "no-answer", "busy", "failed"],
                    example: "initiated"
                },
                startTime: { type: "string", format: "date-time" },
                endTime: { type: "string", format: "date-time" },
                duration: { type: "number", example: 120 }
            }
        },
        ActivityLog: {
            type: "object",
            properties: {
                _id: { type: "string", example: "6650f1a2b3c4d5e6f7a8b9c0" },
                leadId: { type: "string", example: "6650f1a2b3c4d5e6f7a8b9c0" },
                action: {
                    type: "string",
                    enum: ["message_sent", "call_initiated", "lead_created", "reply_received"],
                    example: "lead_created"
                },
                details: { type: "object", example: { name: "John Doe", businessType: "real_estate" } },
                createdAt: { type: "string", format: "date-time" }
            }
        },
        Pagination: {
            type: "object",
            properties: {
                total: { type: "integer", example: 50 },
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 10 },
                pages: { type: "integer", example: 5 }
            }
        },
        SuccessResponse: {
            type: "object",
            properties: {
                status: { type: "integer", example: 200 },
                message: { type: "string", example: "Success" },
                data: { type: "object" }
            }
        },
        ErrorResponse: {
            type: "object",
            properties: {
                status: { type: "integer", example: 400 },
                message: { type: "string", example: "Bad Request" },
                data: { type: "object" }
            }
        },
        LoginRequest: {
            type: "object",
            required: ["email", "password"],
            properties: {
                email: { type: "string", format: "email", example: "admin@company.com" },
                password: { type: "string", format: "password", example: "Admin@123" }
            }
        },
        LoginResponse: {
            type: "object",
            properties: {
                status: { type: "integer", example: 200 },
                message: { type: "string", example: "Login successful" },
                data: {
                    type: "object",
                    properties: {
                        token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
                        admin: {
                            type: "object",
                            properties: {
                                id: { type: "string", example: "6650f1a2b3c4d5e6f7a8b9c0" },
                                name: { type: "string", example: "Default Admin" },
                                email: { type: "string", example: "admin@company.com" },
                                role: { type: "string", example: "admin" }
                            }
                        }
                    }
                }
            }
        },
        CreateLeadRequest: {
            type: "object",
            required: ["name", "mobileNumber", "businessType"],
            properties: {
                name: { type: "string", example: "John Doe" },
                mobileNumber: { type: "string", example: "+919876543210" },
                email: { type: "string", format: "email", example: "john@example.com" },
                businessType: {
                    type: "string",
                    enum: ["real_estate", "healthcare", "education", "ecommerce", "finance", "restaurant", "travel", "other"]
                },
                status: { type: "string", enum: ["new", "contacted", "responded", "converted", "closed"] },
                notes: { type: "string", example: "Interested in premium package" },
                assignedTemplateId: { type: "string" }
            }
        },
        CreateTemplateRequest: {
            type: "object",
            required: ["name", "templateSid", "businessType"],
            properties: {
                name: { type: "string", example: "Welcome Message" },
                templateSid: { type: "string", example: "HX1234567890abcdef" },
                businessType: {
                    type: "string",
                    enum: ["real_estate", "healthcare", "education", "ecommerce", "finance", "restaurant", "travel", "other"]
                },
                variables: { type: "array", items: { type: "string" }, example: ["name", "company"] },
                sampleBody: { type: "string", example: "Hello {{name}}, welcome to {{company}}!" },
                isActive: { type: "boolean", default: true }
            }
        },
        SendMessageRequest: {
            type: "object",
            required: ["leadId"],
            properties: {
                leadId: { type: "string", example: "6650f1a2b3c4d5e6f7a8b9c0" },
                templateId: { type: "string", example: "6650f1a2b3c4d5e6f7a8b9c0", description: "Template ID (required if body is not provided)" },
                body: { type: "string", example: "Hello John, this is a free text message!", description: "Free-text message body (required if templateId is not provided)" },
                variables: { type: "object", example: { name: "John", company: "EzCampaign" }, description: "Template variable values" }
            }
        },
        UpdateProfileRequest: {
            type: "object",
            required: ["name", "email"],
            properties: {
                name: { type: "string", example: "Admin User" },
                email: { type: "string", format: "email", example: "admin@company.com" },
                password: { type: "string", format: "password", example: "NewPass@123", description: "Optional new password" }
            }
        },
        RegisterRequest: {
            type: "object",
            required: ["name", "email", "password", "role"],
            properties: {
                name: { type: "string", example: "New Manager" },
                email: { type: "string", format: "email", example: "manager@company.com" },
                password: { type: "string", format: "password", example: "Manager@123" },
                role: { type: "string", enum: ["admin", "manager"], example: "manager" }
            }
        },
        ConfigResponse: {
            type: "object",
            properties: {
                accountSid: { type: "string", example: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
                authToken: { type: "string", example: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
                whatsappNum: { type: "string", example: "whatsapp:+916291745601" },
                phoneNum: { type: "string", example: "+916291745601" },
                templateSid: { type: "string", example: "HXdc1311d3869ec9e14c9ced8023d7e3e7" },
                baseUrl: { type: "string", format: "uri", example: "http://localhost:8000" }
            }
        },
        UpdateConfigRequest: {
            type: "object",
            required: ["accountSid", "authToken", "whatsappNum", "phoneNum", "templateSid", "baseUrl"],
            properties: {
                accountSid: { type: "string", example: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", description: "Twilio Account SID (AC followed by 32 hex chars)" },
                authToken: { type: "string", example: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", description: "Twilio Auth Token" },
                whatsappNum: { type: "string", example: "whatsapp:+916291745601", description: "WhatsApp sender number (format: whatsapp:+XX...)" },
                phoneNum: { type: "string", example: "+916291745601", description: "Voice caller ID number (format: +XX...)" },
                templateSid: { type: "string", example: "HXdc1311d3869ec9e14c9ced8023d7e3e7", description: "Twilio Content Template SID (HX followed by 32 hex chars)" },
                baseUrl: { type: "string", format: "uri", example: "https://abc123.ngrok.io", description: "Ngrok webhook base URL" }
            }
        },
        InitiateCallRequest: {
            type: "object",
            required: ["leadId", "message"],
            properties: {
                leadId: { type: "string", example: "6650f1a2b3c4d5e6f7a8b9c0" },
                message: { type: "string", example: "Hello, this is a test call from EZ Campaign. The call is now connected." }
            }
        },
        AnalyticsSummary: {
            type: "object",
            properties: {
                leads: {
                    type: "object",
                    properties: {
                        total: { type: "integer", example: 120 },
                        statusBreakdown: { type: "object", example: { new: 30, contacted: 40, responded: 25, converted: 15, closed: 10 } },
                        businessTypeBreakdown: { type: "object", example: { real_estate: 50, healthcare: 30, education: 40 } }
                    }
                },
                messages: {
                    type: "object",
                    properties: {
                        outbound: { type: "integer", example: 200 },
                        inbound: { type: "integer", example: 80 },
                        total: { type: "integer", example: 280 },
                        trend: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    _id: { type: "string", example: "2024-01-15" },
                                    count: { type: "integer", example: 12 }
                                }
                            }
                        }
                    }
                },
                calls: {
                    type: "object",
                    properties: {
                        total: { type: "integer", example: 45 }
                    }
                },
                recentActivities: {
                    type: "array",
                    items: { $ref: "#/components/schemas/ActivityLog" }
                }
            }
        },
        IncomingWhatsAppWebhook: {
            type: "object",
            required: ["From", "Body", "MessageSid", "To"],
            properties: {
                From: { type: "string", example: "whatsapp:+919876543210" },
                Body: { type: "string", example: "Yes, I am interested" },
                MessageSid: { type: "string", example: "SM1234567890abcdef" },
                To: { type: "string", example: "whatsapp:+14155238886" }
            }
        },
        WhatsAppStatusWebhook: {
            type: "object",
            required: ["MessageSid", "MessageStatus"],
            properties: {
                MessageSid: { type: "string", example: "SM1234567890abcdef" },
                MessageStatus: { type: "string", example: "delivered" }
            }
        },
        CallStatusWebhook: {
            type: "object",
            required: ["CallSid", "CallStatus"],
            properties: {
                CallSid: { type: "string", example: "CA1234567890abcdef" },
                CallStatus: { type: "string", example: "completed" },
                CallDuration: { type: "integer", example: 120 }
            }
        }
    },
    securitySchemes: {
        bearerAuth: {
            type: "apiKey",
            in: "cookie",
            name: "token",
            description: "JWT token set as an httpOnly cookie after login"
        }
    }
};
