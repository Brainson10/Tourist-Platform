import { forbiddenError, unauthorizedError } from "@/lib/api/errors";
import { getCurrentUser, isAdmin } from "@/lib/auth/session";

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw unauthorizedError("Please sign in to continue");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireAuthenticatedUser();

  if (!isAdmin(user)) {
    throw forbiddenError("Admin access required");
  }

  return user;
}
