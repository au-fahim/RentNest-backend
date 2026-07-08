import { Router } from "express";
import {
  getAllUsersController,
  updateUserStatusController,
} from "./admin.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { updateUserStatusZodSchema } from "./admin.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

// Endpoint: GET /api/admin/users (Protected: Admin Only)
router.get("/users", auth("ADMIN"), getAllUsersController);

// Endpoint: PATCH /api/admin/users/:id (Protected: Admin Only)
router.patch(
  "/users/:id",
  auth("ADMIN"),
  validateRequest(updateUserStatusZodSchema),
  updateUserStatusController,
);

export const AdminRoutes = router;
