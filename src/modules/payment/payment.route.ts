import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  confirmPaymentController,
  createPaymentIntentController,
  getPaymentDetailsController,
  getTenantPaymentHistoryController,
  payWithDemoCardController,
} from "./payment.controller.js";
import {
  confirmPaymentZodSchema,
  createPaymentIntentZodSchema,
  paymentIdParamZodSchema,
} from "./payment.validation.js";

const router = Router();

router.post(
  "/create",
  auth("TENANT"),
  validateRequest(createPaymentIntentZodSchema),
  createPaymentIntentController,
);

router.post(
  "/confirm",
  auth("TENANT"),
  validateRequest(confirmPaymentZodSchema),
  confirmPaymentController,
);

router.post(
  "/demo-card",
  auth("TENANT"),
  validateRequest(confirmPaymentZodSchema),
  payWithDemoCardController,
);

router.get("/", auth("TENANT"), getTenantPaymentHistoryController);

router.get(
  "/:id",
  auth("TENANT"),
  validateRequest(paymentIdParamZodSchema),
  getPaymentDetailsController,
);

export const PaymentRoutes = router;
