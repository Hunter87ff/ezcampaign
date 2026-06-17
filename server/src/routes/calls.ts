import { Router } from "express";
import { authorize } from "@/middlewares/auth";
import CallController from "@/controllers/calls";

const router = Router();

router.use(authorize);

router.post("/initiate", CallController.initiate);
router.get("/", CallController.list);
router.delete("/:id", CallController.delete);

export default router;
