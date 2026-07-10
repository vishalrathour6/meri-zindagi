import { z } from "zod";

/** Shared field rules so login and register stay consistent. */
const email = z.email("Enter a valid email").trim().min(1, "Email is required");
const password = z.string().min(8, "Password must be at least 8 characters");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
