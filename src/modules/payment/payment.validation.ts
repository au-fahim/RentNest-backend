import { z } from "zod";

export const createPaymentIntentZodSchema = z.object({
  body: z.object({
    rentalRequestId: z.uuid({
      message: "Rental Request ID must be a valid UUID",
    }),
  }),
});

export const confirmPaymentZodSchema = z.object({
  body: z.object({
    paymentId: z.uuid({ message: "Payment ID must be a valid UUID" }),
    // The frontend sends this back to us after the user types in their card
    stripePaymentIntentId: z.string({
      message: "Stripe Payment Intent ID is required",
    }),
  }),
});

export const paymentIdParamZodSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Payment ID must be a valid UUID" }),
  }),
});
