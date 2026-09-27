import "server-only";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth/session";

/** For admin pages: signed-out users go to login, non-admins get a 403 screen. */
export async function getAdminPageUser(returnTo = "/admin") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(returnTo)}`);
  }

  return isAdmin(user) ? user : null;
}

/** Page-level guard. The layout shows the 403 screen; this makes sure no admin data is ever rendered for others. */
export async function requireAdminPage(returnTo) {
  const admin = await getAdminPageUser(returnTo);

  if (!admin) {
    notFound();
  }

  return admin;
}
