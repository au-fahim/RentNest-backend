import { z } from "zod";

export const updateProfileZodSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    // We do NOT allow updating roles or passwords here for security
  }),
});
