import prisma from "@/lib/db";

const safeUserSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  isBlocked: true,
  createdAt: true,
  _count: { select: { trips: true, reviews: true } },
};

const contains = (value) => ({ contains: value, mode: "insensitive" });

export async function listUsers({ search, role, blocked, skip = 0, take = 20 } = {}) {
  const and = [];
  if (role) and.push({ role });
  if (typeof blocked === "boolean") and.push({ isBlocked: blocked });
  if (search) and.push({ OR: [{ fullName: contains(search) }, { email: contains(search) }, { phone: contains(search) }] });
  const where = and.length ? { AND: and } : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, select: safeUserSelect, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.user.count({ where }),
  ]);

  return { items, total };
}

export function findUserById(id) {
  return prisma.user.findUnique({ where: { id }, select: safeUserSelect });
}

export function updateUser(id, data) {
  return prisma.user.update({ where: { id }, data, select: safeUserSelect });
}

export function revokeUserSessions(userId) {
  return prisma.session.deleteMany({ where: { userId } });
}

export function countAdmins() {
  return prisma.user.count({ where: { role: "ADMIN", isBlocked: false } });
}
