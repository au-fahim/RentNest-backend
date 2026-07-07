import { Router } from "express";
import { createPropertyController } from "./property.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createPropertyZodSchema } from "./property.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

// Endpoint: POST /api/properties (Protected: Landlord Only)
router.post(
  "/",
  auth("LANDLORD"),
  validateRequest(createPropertyZodSchema),
  createPropertyController,
);

export const PropertyRoutes = router;
