import { z } from "zod";

export const createRentalRequestZodSchema = z.object({
  body: z
    .object({
      propertyId: z.uuid({ message: "Property ID must be a valid UUID" }),
      moveInDate: z.coerce.date({
        message: "A valid move-in date is required",
      }),
      moveOutDate: z.coerce.date({
        message: "A valid move-out date is required",
      }),
    })
    .refine((data) => data.moveOutDate > data.moveInDate, {
      message: "Move-out date must be strictly after the move-in date",
      path: ["moveOutDate"],
    }),
});

export const updateRentalRequestStatusZodSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Rental request ID must be a valid UUID" }),
  }),
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED", "COMPLETED"], {
      message: "Status must be APPROVED, REJECTED, or COMPLETED",
    }),
  }),
});

export const rentalRequestIdParamZodSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Rental request ID must be a valid UUID" }),
  }),
});
