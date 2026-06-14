import { Router } from "express";
import { authorize } from "@/middlewares/auth";
import AnalyticsController from "@/controllers/analytics";

const router = Router();

router.use(authorize);

router.get("/summary", AnalyticsController.summary);

export default router;
