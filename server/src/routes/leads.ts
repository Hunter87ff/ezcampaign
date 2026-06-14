import { Router } from "express";
import { authorize } from "@/middlewares/auth";
import LeadController from "@/controllers/leads";

const router = Router();

// Apply auth lock to all lead endpoints
router.use(authorize);

router.get("/", LeadController.list);
router.post("/", LeadController.create);
router.get("/:id", LeadController.get);
router.put("/:id", LeadController.update);
router.delete("/:id", LeadController.delete);

export default router;
