import { z } from "zod";

export const registerUserZodSchema = z.object({
  body: z.object({
    name: z.string({ message: "Name is strictly required" }).min(2).max(50),
    email: z
      .string({ message: "Email is required" })
      .email("Invalid email address formatting"),
    password: z
      .string({ message: "Password is required" })
      .min(6, "Password must be at least 6 characters long"),
    role: z.enum(["TENANT", "LANDLORD", "ADMIN"], {
      message: "Role must be either TENANT, LANDLORD, or ADMIN",
    }),
  }),
});

export const loginUserZodSchema = z.object({
  body: z.object({
    email: z.string({ message: "Email is required" }).email(),
    password: z
      .string({ message: "Password is required" })
      .min(1, "Password cannot be blank"),
  }),
});
