"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { loginSchema } from "@/lib/auth/validators";
import { auth } from "@/lib/auth/config";
import { cookies } from "next/headers";

export async function loginAction(formData) {
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

  const cookieStore = await cookies();
  const session = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
    headers: {
      cookie: cookieStore.getAll().map((cookie) => `${cookie.name}=${cookie.value}`).join("; "),
    },
  });

  if (!session) {
    return {
      success: false,
      error: { email: ["Unable to create a session"] },
    };
  }

  return {
    success: true,
    message: "Signed in successfully",
  };
}
