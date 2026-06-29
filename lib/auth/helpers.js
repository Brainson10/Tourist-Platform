import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";

export function isAdmin(user) {
  return user?.role === "ADMIN";
}

export function isGuide(user) {
  return user?.role === "GUIDE";
}

export function isTourist(user) {
  return user?.role === "TOURIST";
}

export function isGovernment(user) {
  return user?.role === "GOVERNMENT";
}

export async function getServerSession(requestHeaders = null) {
  const resolvedHeaders = requestHeaders ?? (await headers());
  return auth.api.getSession({ headers: resolvedHeaders });
}
