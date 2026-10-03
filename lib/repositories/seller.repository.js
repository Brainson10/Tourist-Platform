import prisma from "@/lib/db";

const contains = (value) => ({ contains: value, mode: "insensitive" });

export async function listSellers({ search, skip = 0, take = 20 } = {}) {
  const where = search ? { OR: [{ name: contains(search) }, { address: contains(search) }, { village: { is: { OR: [{ name: contains(search) }, { district: contains(search) }, { state: contains(search) }] } } }] } : {};
  const [items, total] = await Promise.all([
    prisma.localSeller.findMany({ where, include: { village: { select: { name: true, district: true, state: true } }, _count: { select: { souvenirs: true } } }, orderBy: { name: "asc" }, skip, take }),
    prisma.localSeller.count({ where }),
  ]);
  return { items, total };
}

export function listAllSellers() {
  return prisma.localSeller.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, kind: true, village: { select: { name: true, state: true } } } });
}

export function countSellersByIds(ids) {
  return prisma.localSeller.count({ where: { id: { in: ids } } });
}

export function findSellerSlugOwner(slug) {
  return prisma.localSeller.findUnique({ where: { slug }, select: { id: true } });
}

export function createSeller(data) {
  return prisma.localSeller.create({ data });
}

export function updateSeller(id, data) {
  return prisma.localSeller.update({ where: { id }, data });
}

export function deleteSeller(id) {
  return prisma.localSeller.delete({ where: { id }, select: { id: true } });
}

export function villageExists(id) {
  return prisma.village.count({ where: { id } });
}
