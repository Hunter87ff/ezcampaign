import { Router } from "express";
import AuthController from "@/controllers/auth";
import { authorize } from "@/middlewares/auth";

const router = Router();

router.post("/login", AuthController.login);
router.put("/profile", authorize, AuthController.updateProfile);
router.post("/register", authorize, AuthController.register);

export default router;
