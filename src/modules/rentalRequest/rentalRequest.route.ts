import { Router } from "express";
import {
  createRentalRequestController,
  getLandlordRequestsController,
  getTenantRentalRequestByIdController,
  getTenantRentalRequestsController,
  updateRentalRequestStatusController,
} from "./rentalRequest.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  createRentalRequestZodSchema,
  rentalRequestIdParamZodSchema,
  updateRentalRequestStatusZodSchema,
} from "./rentalRequest.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

// ========================
// TENANT ROUTES
// ========================

// Endpoint: POST /api/requests (Protected Route: Tenant Only)
router.post(
  "/",
  auth("TENANT"),
  validateRequest(createRentalRequestZodSchema),
  createRentalRequestController,
);

// Endpoint: GET /api/requests (Protected Route: Tenant Only)
router.get("/", auth("TENANT"), getTenantRentalRequestsController);

// ========================
// LANDLORD ROUTES
// ========================

// Endpoint: GET /api/requests/landlord (Protected Route: Landlord Only)
// Get all requests made for the landlord's properties
router.get("/landlord", auth("LANDLORD"), getLandlordRequestsController);

router.get(
  "/:id",
  auth("TENANT"),
  validateRequest(rentalRequestIdParamZodSchema),
  getTenantRentalRequestByIdController,
);

// Endpoint: PATCH /api/requests/:id/status (Protected Route: Landlord Only)
// Approve or Reject a specific request
router.patch(
  "/:id/status",
  auth("LANDLORD"),
  validateRequest(updateRentalRequestStatusZodSchema),
  updateRentalRequestStatusController,
);

export const RentalRequestRoutes = router;
