import { Router } from "express";
import { authorize } from "@/middlewares/auth";
import ConfigController from "@/controllers/config";

const router = Router();

// Secure configuration endpoints to authenticated users
router.use(authorize);

router.get("/", ConfigController.getConfig);
router.put("/", ConfigController.updateConfig);

export default router;
