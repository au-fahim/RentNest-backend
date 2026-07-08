import { z } from "zod";

export const createReviewZodSchema = z.object({
  body: z.object({
    propertyId: z.string({ message: "Property ID is required" }),
    rating: z
      .number({ message: "Rating is required" })
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),
    comment: z
      .string()
      .min(5, "Comment must be at least 5 characters long")
      .optional(),
  }),
});
