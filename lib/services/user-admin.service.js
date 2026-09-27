import { badRequest, notFoundError } from "@/lib/api/errors";
import * as userRepository from "@/lib/repositories/user.repository";
import { buildMeta, getPagination } from "@/lib/services/pagination";

export async function listUsers(query = {}) {
  const { page, limit, skip } = getPagination(query, 20);
  const { items, total } = await userRepository.listUsers({ ...query, skip, take: limit });
  return { data: items, meta: buildMeta({ page, limit, total }) };
}

/** Role and block changes. Admins can't lock themselves out or remove the last admin. */
export async function updateUserAccess(id, input, actingUser) {
  const target = await userRepository.findUserById(id);

  if (!target) {
    throw notFoundError("User not found");
  }

  if (id === actingUser.id && (input.isBlocked === true || (input.role && input.role !== "ADMIN"))) {
    throw badRequest("You can't block yourself or remove your own admin access");
  }

  const losesAdmin = target.role === "ADMIN" && !target.isBlocked && (input.isBlocked === true || (input.role && input.role !== "ADMIN"));

  if (losesAdmin && (await userRepository.countAdmins()) <= 1) {
    throw badRequest("The platform needs at least one active admin");
  }

  const updated = await userRepository.updateUser(id, input);

  // Blocking signs the user out everywhere immediately.
  if (input.isBlocked === true) {
    await userRepository.revokeUserSessions(id);
  }

  return updated;
}
