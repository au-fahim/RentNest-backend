import { z } from "zod";

export const updateUserStatusZodSchema = z.object({
  body: z.object({
    isBanned: z.boolean({ message: "isBanned must be a strict boolean value" }),
  }),
});
