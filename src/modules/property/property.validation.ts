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

export const updatePropertyZodSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Property ID must be a valid UUID" }),
  }),
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters").optional(),
    description: z
      .string()
      .min(20, "Please provide a detailed description")
      .optional(),
    price: z.number().positive("Price must be a positive number").optional(),
    location: z.string().optional(),
    categoryId: z.string().optional(),
    amenities: z
      .array(z.string())
      .min(1, "Please provide at least one amenity")
      .optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const propertyIdParamZodSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Property ID must be a valid UUID" }),
  }),
});
