import { z } from "zod";

export const createPaymentIntentZodSchema = z.object({
  body: z.object({
    rentalRequestId: z.string({
      message: "Rental Request ID is strictly required",
    }),
  }),
});

export const confirmPaymentZodSchema = z.object({
  body: z.object({
    paymentId: z.string({ message: "Payment ID is required" }),
    // The frontend sends this back to us after the user types in their card
    stripePaymentIntentId: z.string({
      message: "Stripe Payment Intent ID is required",
    }),
  }),
});
