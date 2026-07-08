import { z } from "zod";

export const createRentalRequestZodSchema = z.object({
  body: z.object({
    propertyId: z.string({ message: "Property ID is strictly required" }),
    moveInDate: z.coerce.date({ message: "A valid move-in date is required" }),
    moveOutDate: z.coerce.date({
      message: "A valid move-out date is required",
    }),
  }),
});
