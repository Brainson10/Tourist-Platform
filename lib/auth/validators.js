import { z } from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));

const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(80, "Name is too long"),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
  rememberMe: z.boolean().optional(),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80, "Name is too long"),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .regex(/^[+0-9 ()-]*$/, "Use digits, spaces and + only")
    .optional()
    .transform((value) => value || null),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/** Turns a ZodError into { field: [messages] } for forms. */
export function fieldErrors(error) {
  return z.flattenError(error).fieldErrors;
}
