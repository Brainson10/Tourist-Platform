import prisma from "@/lib/db";
import { EXPERIENCE_CATEGORIES } from "@/lib/validators/common";

const destinationSummary = {
  select: {
    id: true,
    name: true,
    slug: true,
    coverImage: true,
    village: { select: { name: true, district: true, state: true } },
    photos: { orderBy: { displayOrder: "asc" }, take: 1, select: { imageUrl: true } },
  },
};

const contains = (value) => ({ contains: value, mode: "insensitive" });

export function buildExperienceWhere({ search, category, destinationId, destination } = {}) {
  const and = [];

  if (EXPERIENCE_CATEGORIES.includes(category)) and.push({ category });
  if (destinationId) and.push({ destinationId });
  if (destination) and.push({ destination: { is: { slug: destination } } });
  if (search) {
    and.push({
      OR: [
        { title: contains(search) },
        { description: contains(search) },
        { destination: { is: { name: contains(search) } } },
        { destination: { is: { village: { is: { OR: [{ district: contains(search) }, { state: contains(search) }] } } } } },
      ],
    });
  }

  return and.length ? { AND: and } : {};
}

export async function listExperiences({ where = {}, skip = 0, take = 12, orderBy = [{ title: "asc" }] } = {}) {
  const [items, total] = await Promise.all([
    prisma.experience.findMany({ where, include: { destination: destinationSummary }, orderBy, skip, take }),
    prisma.experience.count({ where }),
  ]);

  return { items, total };
}

export function findExperienceById(id) {
  return prisma.experience.findUnique({ where: { id }, include: { destination: destinationSummary } });
}

export function findRelatedExperiences({ id, destinationId, category, take = 4 }) {
  return prisma.experience.findMany({
    where: { id: { not: id }, OR: [{ destinationId }, { category }] },
    include: { destination: destinationSummary },
    take,
  });
}

export function createExperience(data) {
  return prisma.experience.create({ data });
}

export function updateExperience(id, data) {
  return prisma.experience.update({ where: { id }, data });
}

export function deleteExperience(id) {
  return prisma.experience.delete({ where: { id }, select: { id: true } });
}

export function listExperiencesForDestination(destinationId) {
  return prisma.experience.findMany({ where: { destinationId }, select: { id: true, title: true }, orderBy: { title: "asc" } });
}
