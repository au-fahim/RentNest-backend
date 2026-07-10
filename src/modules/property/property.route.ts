import { Router } from "express";
import {
  createPropertyController,
  deletePropertyController,
  getAllPropertiesController,
  getLandlordPropertiesController,
  getPropertyByIdController,
  updatePropertyController,
} from "./property.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  createPropertyZodSchema,
  updatePropertyZodSchema,
} from "./property.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

// Endpoint: GET /api/properties/my-properties (Protected: Landlord Only)
router.get(
  "/my-properties", 
  auth("LANDLORD"), 
  getLandlordPropertiesController
);

// Endpoint: POST /api/properties (Protected Route: Landlord Only)
router.post(
  "/",
  auth("LANDLORD"),
  validateRequest(createPropertyZodSchema),
  createPropertyController,
);

// Endpoint: PATCH /api/properties/:id (Protected Route: Landlord Only)
router.patch(
  "/:id",
  auth("LANDLORD"),
  validateRequest(updatePropertyZodSchema),
  updatePropertyController,
);

// Endpoint: DELETE /api/properties/:id (Protected Route: Landlord Only)
router.delete("/:id", auth("LANDLORD"), deletePropertyController);

// ========================
// PUBLIC ROUTES
// ========================

// Endpoint: GET /api/properties (Public Browse & Filter)
router.get("/", getAllPropertiesController);

// Endpoint: GET /api/properties/:id (Public Property Details)
router.get("/:id", getPropertyByIdController);

export const PropertyRoutes = router;
