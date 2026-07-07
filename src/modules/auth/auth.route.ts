import { Router } from "express";
import { registerUserController } from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { registerUserZodSchema } from "./auth.validation.js";

const router = Router();

// Endpoint: POST /api/auth/register
router.post(
  "/register",
  validateRequest(registerUserZodSchema),
  registerUserController,
);

export const AuthRoutes = router;
