import prisma from "@/lib/db";

const contains = (value) => ({ contains: value, mode: "insensitive" });

export async function listVillages({ search, state, skip = 0, take = 20 } = {}) {
  const and = [];
  if (state) and.push({ state: { equals: state, mode: "insensitive" } });
  if (search) and.push({ OR: [{ name: contains(search) }, { district: contains(search) }, { state: contains(search) }, { pincode: contains(search) }] });
  const where = and.length ? { AND: and } : {};

  const [items, total] = await Promise.all([
    prisma.village.findMany({ where, include: { _count: { select: { destinations: true } } }, orderBy: [{ state: "asc" }, { district: "asc" }, { name: "asc" }], skip, take }),
    prisma.village.count({ where }),
  ]);

  return { items, total };
}

export function listAllVillages() {
  return prisma.village.findMany({ orderBy: [{ state: "asc" }, { district: "asc" }, { name: "asc" }] });
}

export function createVillage(data) {
  return prisma.village.create({ data });
}

export function updateVillage(id, data) {
  return prisma.village.update({ where: { id }, data });
}

export function deleteVillage(id) {
  return prisma.village.delete({ where: { id }, select: { id: true } });
}

export function countVillageDestinations(id) {
  return prisma.destination.count({ where: { villageId: id } });
}

export async function listCategories({ search, skip = 0, take = 50 } = {}) {
  const where = search ? { OR: [{ name: contains(search) }, { slug: contains(search) }] } : {};
  const [items, total] = await Promise.all([
    prisma.category.findMany({ where, include: { _count: { select: { destinations: true } } }, orderBy: { name: "asc" }, skip, take }),
    prisma.category.count({ where }),
  ]);

  return { items, total };
}

export function listAllCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
}

export function createCategory(data) {
  return prisma.category.create({ data });
}

export function updateCategory(id, data) {
  return prisma.category.update({ where: { id }, data });
}

export function deleteCategory(id) {
  return prisma.category.delete({ where: { id }, select: { id: true } });
}
