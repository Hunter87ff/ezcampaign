import twilio from "twilio";
import { logger } from "@/utils/logger";
import config from "@/config";

if (!config.twilio.sid || !config.twilio.auth_token) {
    logger.error("Twilio configuration credentials missing on server");
    process.exit(1);
}

export const client = twilio(config.twilio.sid, config.twilio.auth_token);


async function configureTwilio() {
    try {
        if (!client.messaging?.v1?.services) return;
        const services = await client.messaging.v1.services.list({ limit: 1 });
        if (!services || services.length < 1){
            logger.error("No twilio services found, webhook will not be configured");
            return;
        }
        const serviceSid = services[0]!.sid!;
        await client.messaging.v1.services(serviceSid).update({
            inboundMethod: "POST",
            inboundRequestUrl: `${config.twilio.hook_endpoint}/webhook/whatsapp/incoming`
        });
        logger.info(`Successfully updated Twilio inbound webhook for service: ${serviceSid}`);

    } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        logger.error("Failed to update Twilio Messaging Service webhook:", errMsg);
    }
}

configureTwilio()