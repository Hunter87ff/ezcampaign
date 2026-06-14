import { Router } from "express";
import WebhookController from "@/controllers/webhooks";

const router = Router();

router.post("/whatsapp/incoming", WebhookController.incomingWhatsApp);
router.post("/whatsapp/status", WebhookController.whatsappStatus);
router.post("/call/status", WebhookController.callStatus);

export default router;
