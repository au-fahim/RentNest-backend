import { Router } from "express";
import { loginUserController, registerUserController } from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { loginUserZodSchema, registerUserZodSchema } from "./auth.validation.js";

const router = Router();

// Endpoint: POST /api/auth/register
router.post(
  "/register",
  validateRequest(registerUserZodSchema),
  registerUserController,
);

// Endpoint: POST /api/auth/login
router.post(
  "/login",
  validateRequest(loginUserZodSchema),
  loginUserController,
);

export const AuthRoutes = router;
