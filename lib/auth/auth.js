import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";

export async function getSession() {
  const requestHeaders = await headers();
  return auth.api.getSession({
    headers: requestHeaders,
  });
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireSession() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: Missing session");
  }

  return session;
}
