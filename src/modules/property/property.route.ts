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
  propertyIdParamZodSchema,
  updatePropertyZodSchema,
} from "./property.validation.js";
import multer from "multer";

const storage = multer.memoryStorage();

// File filter to accept common image mime types
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG and WEBP are allowed."));
  }
};

// Limit file size to 5MB per file and maximum 6 files
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

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
  upload.array("images", 6),
  validateRequest(createPropertyZodSchema),
  createPropertyController,
);

// Endpoint: PATCH /api/properties/:id (Protected Route: Landlord Only)
router.patch(
  "/:id",
  auth("LANDLORD"),
  upload.array("images", 6),
  validateRequest(updatePropertyZodSchema),
  updatePropertyController,
);

// Endpoint: DELETE /api/properties/:id (Protected Route: Landlord Only)
router.delete(
  "/:id",
  auth("LANDLORD"),
  validateRequest(propertyIdParamZodSchema),
  deletePropertyController,
);

// ========================
// PUBLIC ROUTES
// ========================

// Endpoint: GET /api/properties (Public Browse & Filter)
router.get("/", getAllPropertiesController);

// Endpoint: GET /api/properties/:id (Public Property Details)
router.get(
  "/:id",
  validateRequest(propertyIdParamZodSchema),
  getPropertyByIdController,
);

export const PropertyRoutes = router;
