import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "@/lib/db";

const SESSION_COOKIE = "tourism_session";

function getSessionSecret() {
  return process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET || "dev-secret-change-me";
}

export async function setSessionCookie(user, rememberMe = false) {
  const cookieStore = await cookies();
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    getSessionSecret(),
    {
      expiresIn: maxAge,
    }
  );

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getSessionSecret());

    if (!payload?.sub) {
      return null;
    }

    return prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
  } catch {
    return null;
  }
}
