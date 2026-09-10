import { z } from "zod";

const phoneRegex = /^\+?[1-9]\d{6,14}$/;

/** Update the user's display name and optional phone number. */
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || phoneRegex.test(value), {
      message: "Enter a valid phone number, e.g. +14155552671",
    }),
});

/** Change the user's password — requires the current one for confirmation. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
