import prisma from "@/lib/db";

export function findPermitByState(state) {
  return prisma.statePermit.findFirst({ where: { state: { equals: state, mode: "insensitive" } } });
}

export async function listPermits({ search, skip = 0, take = 50 } = {}) {
  const where = search ? { state: { contains: search, mode: "insensitive" } } : {};
  const [items, total] = await Promise.all([
    prisma.statePermit.findMany({ where, orderBy: { state: "asc" }, skip, take }),
    prisma.statePermit.count({ where }),
  ]);

  return { items, total };
}

export function createPermit(data) {
  return prisma.statePermit.create({ data });
}

export function updatePermit(id, data) {
  return prisma.statePermit.update({ where: { id }, data });
}

export function deletePermit(id) {
  return prisma.statePermit.delete({ where: { id }, select: { id: true } });
}
