import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).superRefine(({ password, confirmPassword }, ctx) => {
  if (password !== confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }

  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must contain at least one uppercase letter and one number",
      path: ["password"],
    });
  }
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").optional(),
  phone: z.string().trim().optional(),
  avatar: z.string().url().optional().or(z.literal("")),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).superRefine(({ newPassword, confirmPassword }, ctx) => {
  if (newPassword !== confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
});
