import prisma from "@/lib/db";

const villageSelect = { id: true, name: true, district: true, state: true, latitude: true, longitude: true };

export const destinationCardInclude = {
  village: { select: villageSelect },
  photos: { orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }], take: 1, select: { imageUrl: true } },
  destinationCategories: { include: { category: { select: { id: true, name: true, slug: true } } } },
  _count: { select: { experiences: true, festivals: true } },
};

const destinationDetailInclude = {
  village: { select: villageSelect },
  photos: { orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }], select: { id: true, imageUrl: true, caption: true } },
  destinationCategories: { include: { category: { select: { id: true, name: true, slug: true } } } },
  experiences: { orderBy: { title: "asc" } },
  festivals: { orderBy: [{ startDate: { sort: "asc", nulls: "last" } }] },
  stories: {
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, slug: true, title: true, excerpt: true, content: true, coverImage: true, createdAt: true },
  },
};

const insensitive = (value) => ({ equals: value, mode: "insensitive" });
const contains = (value) => ({ contains: value, mode: "insensitive" });

export function buildDestinationWhere({ search, category, state, district, villageId, featured, month } = {}) {
  const and = [];

  if (typeof featured === "boolean") and.push({ isFeatured: featured });
  if (month) and.push({ bestMonths: { has: month } });
  if (villageId) and.push({ villageId });
  if (state) and.push({ village: { is: { state: insensitive(state) } } });
  if (district) and.push({ village: { is: { district: insensitive(district) } } });
  if (category) {
    and.push({
      destinationCategories: {
        some: { category: { is: { OR: [{ slug: insensitive(category) }, { name: insensitive(category) }] } } },
      },
    });
  }

  if (search) {
    const terms = search.split(/\s+/).filter((term) => term.length > 1).slice(0, 5);

    // Every word must match somewhere, so "loktak manipur" finds Loktak Lake in Manipur.
    for (const term of terms.length ? terms : [search]) {
      and.push({
        OR: [
          { name: contains(term) },
          { shortDescription: contains(term) },
          { description: contains(term) },
          { tags: { has: term.toLowerCase() } },
          { village: { is: { OR: [{ name: contains(term) }, { district: contains(term) }, { state: contains(term) }] } } },
          { destinationCategories: { some: { category: { is: { name: contains(term) } } } } },
          { experiences: { some: { title: contains(term) } } },
          { festivals: { some: { title: contains(term) } } },
        ],
      });
    }
  }

  return and.length ? { AND: and } : {};
}

export const DESTINATION_ORDER = {
  recommended: [{ isFeatured: "desc" }, { ratingAverage: "desc" }, { name: "asc" }],
  rating: [{ ratingAverage: "desc" }, { reviewCount: "desc" }, { name: "asc" }],
  name: [{ name: "asc" }],
  newest: [{ createdAt: "desc" }],
};

export async function listDestinations({ where = {}, orderBy = DESTINATION_ORDER.recommended, skip = 0, take = 12 } = {}) {
  const [destinations, total] = await Promise.all([
    prisma.destination.findMany({ where, include: destinationCardInclude, orderBy, skip, take }),
    prisma.destination.count({ where }),
  ]);

  return { destinations, total };
}

export function findDestinationBySlug(slug) {
  return prisma.destination.findUnique({ where: { slug }, include: destinationDetailInclude });
}

export function findDestinationById(id) {
  return prisma.destination.findUnique({ where: { id }, include: destinationDetailInclude });
}

export function findDestinationBySlugOrId(value) {
  return prisma.destination.findFirst({ where: { OR: [{ id: value }, { slug: value }] }, include: destinationDetailInclude });
}

export function findDestinationSummary(id) {
  return prisma.destination.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true, latitude: true, longitude: true },
  });
}

export function findDestinationsInBox({ minLatitude, maxLatitude, minLongitude, maxLongitude, excludeId }) {
  return prisma.destination.findMany({
    where: {
      latitude: { gte: minLatitude, lte: maxLatitude },
      longitude: { gte: minLongitude, lte: maxLongitude },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    include: destinationCardInclude,
    take: 100,
  });
}

export function findDestinationCards({ where = {}, orderBy = DESTINATION_ORDER.recommended, take = 8 } = {}) {
  return prisma.destination.findMany({ where, include: destinationCardInclude, orderBy, take });
}

export function findSlugOwner(slug) {
  return prisma.destination.findUnique({ where: { slug }, select: { id: true } });
}

export async function createDestination(data, { categoryIds, photos }) {
  return prisma.destination.create({
    data: {
      ...data,
      destinationCategories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
      photos: { create: photos.map((photo, index) => ({ imageUrl: photo.url, caption: photo.caption ?? null, displayOrder: index, isCover: index === 0 })) },
    },
    select: { id: true, slug: true },
  });
}

export async function updateDestination(id, data, { categoryIds, photos }) {
  return prisma.$transaction(async (tx) => {
    await tx.destinationCategory.deleteMany({ where: { destinationId: id } });
    await tx.destinationPhoto.deleteMany({ where: { destinationId: id } });

    return tx.destination.update({
      where: { id },
      data: {
        ...data,
        destinationCategories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
        photos: { create: photos.map((photo, index) => ({ imageUrl: photo.url, caption: photo.caption ?? null, displayOrder: index, isCover: index === 0 })) },
      },
      select: { id: true, slug: true },
    });
  });
}

export function deleteDestination(id) {
  return prisma.destination.delete({ where: { id }, select: { id: true } });
}

export function countCategoriesByIds(ids) {
  return prisma.category.count({ where: { id: { in: ids } } });
}

export function villageExists(id) {
  return prisma.village.findUnique({ where: { id }, select: { id: true } });
}

export function listDestinationOptions() {
  return prisma.destination.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } });
}

/** States and districts that actually have destinations, for filters. */
export async function listLocationFacets() {
  const villages = await prisma.village.findMany({
    where: { destinations: { some: {} } },
    select: { district: true, state: true },
    orderBy: [{ state: "asc" }, { district: "asc" }],
  });

  const states = new Map();

  for (const { state, district } of villages) {
    if (!states.has(state)) states.set(state, new Set());
    states.get(state).add(district);
  }

  return [...states.entries()].map(([state, districts]) => ({ state, districts: [...districts] }));
}

/** Destination counts per state, e.g. { Assam: 2, Manipur: 2 }. */
export async function countDestinationsByState() {
  const villages = await prisma.village.findMany({ select: { state: true, _count: { select: { destinations: true } } } });
  const counts = {};

  for (const village of villages) {
    counts[village.state] = (counts[village.state] ?? 0) + village._count.destinations;
  }

  return counts;
}

export function listCategoriesWithCounts() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { destinations: true } } },
  });
}

export function updateRatingCache(destinationId, { ratingAverage, reviewCount }) {
  return prisma.destination.update({ where: { id: destinationId }, data: { ratingAverage, reviewCount } });
}
