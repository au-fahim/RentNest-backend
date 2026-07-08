import { Router } from "express";
import { createPaymentIntentController } from "./payment.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createPaymentIntentZodSchema } from "./payment.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

// Endpoint: POST /api/payments/create (Protected Route: Tenant Only)
router.post(
  "/create",
  auth("TENANT"),
  validateRequest(createPaymentIntentZodSchema),
  createPaymentIntentController,
);

export const PaymentRoutes = router;
