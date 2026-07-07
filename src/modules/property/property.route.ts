import { Router } from "express";
import {
  createPropertyController,
  deletePropertyController,
  updatePropertyController,
} from "./property.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  createPropertyZodSchema,
  updatePropertyZodSchema,
} from "./property.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

// Endpoint: POST /api/properties (Protected: Landlord Only)
router.post(
  "/",
  auth("LANDLORD"),
  validateRequest(createPropertyZodSchema),
  createPropertyController,
);

// Endpoint: PATCH /api/properties/:id (Protected: Landlord Only)
router.patch(
  "/:id",
  auth("LANDLORD"),
  validateRequest(updatePropertyZodSchema),
  updatePropertyController,
);

// Endpoint: DELETE /api/properties/:id (Protected: Landlord Only)
router.delete("/:id", auth("LANDLORD"), deletePropertyController);

export const PropertyRoutes = router;
