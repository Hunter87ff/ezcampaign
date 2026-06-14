import { Router } from "express";
import TwiMLController from "@/controllers/twiml";

const router = Router();

router.get("/connect/:leadId", TwiMLController.connect);

export default router;
