import { Router } from "express";
import { createReviewController } from "./review.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createReviewZodSchema } from "./review.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

// Endpoint: POST /api/reviews (Protected: Tenant Only)
router.post(
  "/",
  auth("TENANT"),
  validateRequest(createReviewZodSchema),
  createReviewController,
);

export const ReviewRoutes = router;
