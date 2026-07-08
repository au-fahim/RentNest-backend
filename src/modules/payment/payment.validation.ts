import { z } from "zod";

export const createPaymentIntentZodSchema = z.object({
  body: z.object({
    rentalRequestId: z.string({
      message: "Rental Request ID is strictly required",
    }),
  }),
});
