import config from "@/config";
import swaggerJsdoc from "swagger-jsdoc";
import { components } from "./schema";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "EzCampaign API",
            version: "1.0.0",
            description: "WhatsApp & Voice campaign management API powered by Twilio. Manage leads, send WhatsApp template messages, initiate voice calls, and track analytics.",
            contact: {
                name: "EzCampaign Support"
            }
        },
        servers: [
            {
                url: config.endpoint,
                description: "Development server"
            }
        ],
        components,
        paths: {}
    },
    apis: [
        "./src/swagger/api/*.ts"
    ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
