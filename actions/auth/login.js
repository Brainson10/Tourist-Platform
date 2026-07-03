"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { loginSchema } from "@/lib/auth/validators";
import { setSessionCookie } from "@/lib/auth/session";

export async function loginAction(_previousState, formData) {
  const payload = Object.fromEntries(formData.entries());
  const parsed = loginSchema.safeParse({
    ...payload,
    rememberMe: payload.rememberMe === "on",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password, rememberMe } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return {
      success: false,
      error: { email: ["Invalid credentials"] },
    };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return {
      success: false,
      error: { password: ["Invalid credentials"] },
    };
  }

  await setSessionCookie(user, rememberMe);

  return {
    success: true,
    message: "Signed in successfully",
    redirectTo: user.role === "ADMIN" ? "/admin" : "/dashboard",
  };
}
