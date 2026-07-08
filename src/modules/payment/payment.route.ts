import { Router } from "express";
import {
  confirmPaymentController,
  createPaymentIntentController,
} from "./payment.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  confirmPaymentZodSchema,
  createPaymentIntentZodSchema,
} from "./payment.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

// Endpoint: POST /api/payments/create (Protected: Tenant Only)
router.post(
  "/create",
  auth("TENANT"),
  validateRequest(createPaymentIntentZodSchema),
  createPaymentIntentController,
);

// Endpoint (Confirm Payment): POST /api/payments/confirm (Protected: Tenant Only)
router.post(
  "/confirm",
  auth("TENANT"),
  validateRequest(confirmPaymentZodSchema),
  confirmPaymentController,
);

export const PaymentRoutes = router;
