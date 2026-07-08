import { Router } from "express";
import {
  getAllPropertiesAdminController,
  getAllRentalsAdminController,
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

// Endpoint: GET /api/admin/properties (Protected: Admin Only) - Get all properties
router.get("/properties", auth("ADMIN"), getAllPropertiesAdminController);

// Endpoint: GET /api/admin/rentals (Protected: Admin Only) - Get all rental requests
router.get("/rentals", auth("ADMIN"), getAllRentalsAdminController);

export const AdminRoutes = router;
