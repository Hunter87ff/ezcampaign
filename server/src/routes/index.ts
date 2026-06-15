import { Router } from "express";
import authRoutes from "./auth";
import leadRoutes from "./leads";
import templateRoutes from "./templates";
import messageRoutes from "./messages";
import callRoutes from "./calls";
import webhookRoutes from "./webhooks";
import twimlRoutes from "./twiml";
import analyticsRoutes from "./analytics";
import configRoutes from "./config";

const router = Router();

router.use("/api/auth", authRoutes);
router.use("/api/leads", leadRoutes);
router.use("/api/templates", templateRoutes);
router.use("/api/messages", messageRoutes);
router.use("/api/calls", callRoutes);
router.use("/api/analytics", analyticsRoutes);
router.use("/api/config", configRoutes);
router.use("/webhook", webhookRoutes);
router.use("/twiml", twimlRoutes);

export default router;