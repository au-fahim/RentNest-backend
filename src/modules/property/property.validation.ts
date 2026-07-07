import { z } from "zod";

export const createPropertyZodSchema = z.object({
  body: z.object({
    title: z
      .string({ message: "Title is required" })
      .min(5, "Title must be at least 5 characters"),
    description: z
      .string({ message: "Description is required" })
      .min(20, "Please provide a detailed description"),
    price: z
      .number({ message: "Price is required" })
      .positive("Price must be a positive number"),
    location: z.string({ message: "Location is required" }),
    categoryId: z.string({ message: "Category ID is required" }),
    amenities: z
      .array(z.string())
      .min(1, "Please provide at least one amenity"),
  }),
});
