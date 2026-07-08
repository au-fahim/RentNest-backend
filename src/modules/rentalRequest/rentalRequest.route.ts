import { Router } from "express";
import { createRentalRequestController } from "./rentalRequest.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createRentalRequestZodSchema } from "./rentalRequest.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

// Endpoint: POST /api/requests (Protected Route: Tenant Only)
router.post(
  "/",
  auth("TENANT"),
  validateRequest(createRentalRequestZodSchema),
  createRentalRequestController,
);

export const RentalRequestRoutes = router;
