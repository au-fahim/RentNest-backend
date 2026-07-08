import { Router } from "express";
import {
  getUserProfileController,
  updateProfileController,
} from "./user.controller.js";
import { auth } from "../../middlewares/auth.js";
import { updateProfileZodSchema } from "./user.validation.js";
import { validateRequest } from "../../middlewares/validateRequest.js";

const router = Router();

// Endpoint: GET /api/users/profile
// Protected route: Requires a valid JWT token
router.get("/profile", auth(), getUserProfileController);

// Endpoint: PATCH /api/users/profile
router.patch(
  "/profile",
  auth(), // Open to Tenant, Landlord, and Admin
  validateRequest(updateProfileZodSchema),
  updateProfileController,
);

export const UserRoutes = router;
