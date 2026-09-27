import prisma from "@/lib/db";
import { EXPERIENCE_CATEGORIES } from "@/lib/validators/common";

const destinationSummary = {
  select: { id: true, name: true, slug: true, coverImage: true, village: { select: { name: true, district: true, state: true } } },
};

const contains = (value) => ({ contains: value, mode: "insensitive" });

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function buildFestivalWhere({ search, category, destinationId, featured, when = "upcoming" } = {}) {
  const and = [];
  const today = startOfToday();

  if (EXPERIENCE_CATEGORIES.includes(category)) and.push({ category });
  if (destinationId) and.push({ destinationId });
  if (typeof featured === "boolean") and.push({ isFeatured: featured });
  if (search) {
    and.push({
      OR: [{ title: contains(search) }, { description: contains(search) }, { destination: { is: { name: contains(search) } } }],
    });
  }

  // "Upcoming" includes festivals happening now and those without announced dates.
  if (when === "upcoming") {
    and.push({ OR: [{ startDate: null }, { endDate: { gte: today } }, { AND: [{ endDate: null }, { startDate: { gte: today } }] }] });
  } else if (when === "past") {
    and.push({ OR: [{ endDate: { lt: today } }, { AND: [{ endDate: null }, { startDate: { lt: today } }] }] });
  }

  return and.length ? { AND: and } : {};
}

export async function listFestivals({ where = {}, skip = 0, take = 12, when = "upcoming" } = {}) {
  const orderBy = when === "past" ? [{ startDate: "desc" }] : [{ startDate: { sort: "asc", nulls: "last" } }, { title: "asc" }];
  const [items, total] = await Promise.all([
    prisma.festival.findMany({ where, include: { destination: destinationSummary }, orderBy, skip, take }),
    prisma.festival.count({ where }),
  ]);

  return { items, total };
}

export function findFestivalBySlug(slug) {
  return prisma.festival.findUnique({ where: { slug }, include: { destination: destinationSummary } });
}

export function findFestivalById(id) {
  return prisma.festival.findUnique({ where: { id }, include: { destination: destinationSummary } });
}

export function findSlugOwner(slug) {
  return prisma.festival.findUnique({ where: { slug }, select: { id: true } });
}

export function createFestival(data) {
  return prisma.festival.create({ data });
}

export function updateFestival(id, data) {
  return prisma.festival.update({ where: { id }, data });
}

export function deleteFestival(id) {
  return prisma.festival.delete({ where: { id }, select: { id: true } });
}
