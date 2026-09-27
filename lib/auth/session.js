import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";

export const ROLES = {
  TOURIST: "TOURIST",
  GUIDE: "GUIDE",
  ADMIN: "ADMIN",
};

function toPublicUser(user) {
  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    avatar: user.image ?? null,
    phone: user.phone ?? null,
    role: user.role ?? ROLES.TOURIST,
    createdAt: user.createdAt,
  };
}

/**
 * Returns the signed-in user for the current request, or null.
 * Blocked users are treated as signed out. Cached per request.
 */
export const getCurrentUser = cache(async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.isBlocked) {
      return null;
    }

    return toPublicUser(session.user);
  } catch {
    return null;
  }
});

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN;
}

/** For server components: redirects to login when signed out. */
export async function requireUserPage(returnTo) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(returnTo || "/dashboard")}`);
  }

  return user;
}
