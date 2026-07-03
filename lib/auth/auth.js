import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { getSessionUser } from "@/lib/auth/session";

export async function getSession() {
  const requestHeaders = await headers();
  return auth.api.getSession({
    headers: requestHeaders,
  });
}

export async function getCurrentUser() {
  const sessionUser = await getSessionUser();

  if (sessionUser) {
    return sessionUser;
  }

  try {
    const session = await getSession();
    return session?.user ?? null;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: Missing session");
  }

  return session;
}
