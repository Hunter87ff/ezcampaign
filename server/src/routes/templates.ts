import { Router } from "express";
import { authorize } from "@/middlewares/auth";
import TemplateController from "@/controllers/templates";

const router = Router();

router.use(authorize);

router.get("/", TemplateController.list);
router.post("/", TemplateController.create);
router.delete("/:id", TemplateController.delete);

export default router;
