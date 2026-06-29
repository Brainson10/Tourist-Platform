import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";
import { forbiddenError, unauthorizedError } from "@/lib/api/errors";

export async function getAuthenticatedUser() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        sessionUser.id ? { id: sessionUser.id } : undefined,
        sessionUser.email ? { email: sessionUser.email } : undefined,
      ].filter(Boolean),
    },
  });

  return user ?? sessionUser;
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw unauthorizedError();
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireAuthenticatedUser();

  if (user.role !== "ADMIN") {
    throw forbiddenError("Admin access required");
  }

  return user;
}
