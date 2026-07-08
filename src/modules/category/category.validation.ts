import { z } from "zod";

export const createCategoryZodSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Category name is strictly required" })
      .min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
  }),
});

export const updateCategoryZodSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
  }),
});
