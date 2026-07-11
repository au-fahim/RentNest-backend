import { Router } from "express";
import {
  confirmPaymentController,
  createPaymentIntentController,
  getPaymentDetailsController,
  getTenantPaymentHistoryController,
} from "./payment.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  confirmPaymentZodSchema,
  createPaymentIntentZodSchema,
  paymentIdParamZodSchema,
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

// Endpoint: POST /api/payments/confirm (Protected: Tenant Only) - Confirm Payment
router.post(
  "/confirm",
  auth("TENANT"),
  validateRequest(confirmPaymentZodSchema),
  confirmPaymentController,
);

// Endpoint: GET /api/payments (Protected: Tenant Only) - Get payment history
router.get("/", auth("TENANT"), getTenantPaymentHistoryController);

// Endpoint: GET /api/payments/:id (Protected: Tenant Only) - Get specific payment details
router.get(
  "/:id",
  auth("TENANT"),
  validateRequest(paymentIdParamZodSchema),
  getPaymentDetailsController,
);

export const PaymentRoutes = router;
