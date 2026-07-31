import { z } from "zod";

export const createPropertyZodSchema = z.object({
  body: z.object({
    title: z
      .string({ message: "Title is required" })
      .min(5, "Title must be at least 5 characters"),
    description: z
      .string({ message: "Description is required" })
      .min(20, "Please provide a detailed description"),
    price: z.coerce
      .number({ message: "Price is required" })
      .positive("Price must be a positive number"),
    location: z.string({ message: "Location is required" }),
    categoryId: z.string({ message: "Category ID is required" }),
    amenities: z.union([
      z.array(z.string()).min(1, "Please provide at least one amenity"),
      z.string(),
    ]),
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
    price: z.coerce
      .number()
      .positive("Price must be a positive number")
      .optional(),
    location: z.string().optional(),
    categoryId: z.string().optional(),
    amenities: z
      .union([
        z.array(z.string()).min(1, "Please provide at least one amenity"),
        z.string(),
      ])
      .optional(),
    removeImageIds: z
      .union([
        z.array(
          z.string().uuid({ message: "Each image ID must be a valid UUID" }),
        ),
        z.string(),
      ])
      .optional(),
    replaceImageIds: z
      .union([
        z.array(
          z.string().uuid({ message: "Each image ID must be a valid UUID" }),
        ),
        z.string(),
      ])
      .optional(),
    clearImages: z.coerce.boolean().optional(),
    isAvailable: z.coerce.boolean().optional(),
  }),
});

export const deletePropertyImageZodSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Property ID must be a valid UUID" }),
    imageId: z.uuid({ message: "Image ID must be a valid UUID" }),
  }),
});

export const propertyIdParamZodSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Property ID must be a valid UUID" }),
  }),
});
