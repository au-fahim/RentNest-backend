import { z } from "zod";

export const createReviewZodSchema = z.object({
  body: z.object({
    propertyId: z.uuid({ message: "Property ID must be a valid UUID" }),
    rating: z
      .number({ message: "Rating is required" })
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),
    comment: z
      .string({ message: "Comment is required" })
      .min(5, "Comment must be at least 5 characters long"),
  }),
});
