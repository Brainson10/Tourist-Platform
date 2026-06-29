import { z } from "zod";

export const userSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  passwordHash: z.string().min(1, "Password hash is required"),
  avatar: z.string().url().optional().or(z.literal("")),
  role: z.enum(["TOURIST", "ADMIN", "GUIDE", "GOVERNMENT"]).optional(),
  phone: z.string().optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});
