import { Router } from "express";
import { authorize } from "@/middlewares/auth";
import MessageController from "@/controllers/messages";

const router = Router();

router.use(authorize);

router.post("/send", MessageController.send);
router.get("/:leadId", MessageController.history);

export default router;
