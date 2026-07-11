import { z } from "zod";

export const updateUserStatusZodSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "User ID must be a valid UUID" }),
  }),
  body: z.object({
    isBanned: z.boolean({ message: "isBanned must be a strict boolean value" }),
  }),
});
