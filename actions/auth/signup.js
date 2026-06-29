"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { signupSchema } from "@/lib/auth/validators";

export async function signupAction(formData) {
  const payload = Object.fromEntries(formData.entries());
  const parsed = signupSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { fullName, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return {
      success: false,
      error: { email: ["An account with this email already exists"] },
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: "TOURIST",
    },
  });

  return {
    success: true,
    message: "Account created successfully",
  };
}
