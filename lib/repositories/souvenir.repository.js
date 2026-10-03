import prisma from "@/lib/db";

const contains = (value) => ({ contains: value, mode: "insensitive" });
const insensitive = (value) => ({ equals: value, mode: "insensitive" });

const destinationSummary = {
  select: { id: true, name: true, slug: true, latitude: true, longitude: true, coverImage: true, village: { select: { district: true, state: true } } },
};

/** Everything a souvenir card needs (and the ranking inputs), without the long text fields. */
export const souvenirCardSelect = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  priceMin: true,
  priceMax: true,
  audiences: true,
  interests: true,
  qualities: true,
  availability: true,
  coverImage: true,
  isFeatured: true,
  isPublished: true,
  needsVerification: true,
  category: { select: { id: true, name: true, slug: true, icon: true } },
  photos: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
  destinations: { select: { destination: destinationSummary } },
  sellers: { select: { seller: { select: { id: true, name: true, kind: true, latitude: true, longitude: true } } } },
};

const souvenirDetailInclude = {
  category: true,
  photos: { orderBy: { position: "asc" } },
  destinations: { include: { destination: destinationSummary } },
  sellers: { include: { seller: { include: { village: { select: { name: true, district: true, state: true } } } } } },
};

/**
 * Server-side filters. The budget test keeps items whose approximate range overlaps the band;
 * a single known price counts as both ends.
 */
export function buildSouvenirWhere({ q, destinationSlug, destinationId, state, categorySlug, band, audience, quality, interest, includeUnpublished = false } = {}) {
  const and = [];

  if (!includeUnpublished) and.push({ isPublished: true });
  if (destinationId) and.push({ destinations: { some: { destinationId } } });
  if (destinationSlug) and.push({ destinations: { some: { destination: { is: { slug: destinationSlug } } } } });
  if (state) and.push({ destinations: { some: { destination: { is: { village: { is: { state: insensitive(state) } } } } } } });
  if (categorySlug) and.push({ category: { is: { slug: categorySlug } } });
  if (audience) and.push({ audiences: { has: audience } });
  if (quality) and.push({ qualities: { has: quality } });
  if (interest) and.push({ interests: { has: interest } });

  if (band) {
    const upper = band.max ?? 100_000_000;
    and.push({
      OR: [
        { AND: [{ priceMin: { lte: upper } }, { OR: [{ priceMax: { gte: band.min } }, { AND: [{ priceMax: null }, { priceMin: { gte: band.min } }] }] }] },
        { AND: [{ priceMin: null }, { priceMax: { gte: band.min, lte: upper } }] },
      ],
    });
  }

  if (q) {
    for (const term of q.split(/\s+/).filter(Boolean).slice(0, 4)) {
      and.push({
        OR: [
          { name: contains(term) },
          { shortDescription: contains(term) },
          { description: contains(term) },
          { category: { is: { name: contains(term) } } },
          { sellers: { some: { seller: { is: { name: contains(term) } } } } },
          { destinations: { some: { destination: { is: { name: contains(term) } } } } },
        ],
      });
    }
  }

  return and.length ? { AND: and } : {};
}

const ORDER = [{ isFeatured: "desc" }, { name: "asc" }];

export async function listSouvenirs({ where = {}, skip = 0, take = 12 } = {}) {
  const [items, total] = await Promise.all([
    prisma.souvenir.findMany({ where, select: souvenirCardSelect, orderBy: ORDER, skip, take }),
    prisma.souvenir.count({ where }),
  ]);
  return { items, total };
}

export function findSouvenirCards({ where = {}, take = 200 } = {}) {
  return prisma.souvenir.findMany({ where, select: souvenirCardSelect, orderBy: ORDER, take });
}

export function findSouvenirBySlug(slug) {
  return prisma.souvenir.findUnique({ where: { slug }, include: souvenirDetailInclude });
}

export function findSouvenirById(id) {
  return prisma.souvenir.findUnique({ where: { id }, include: souvenirDetailInclude });
}

export function findSouvenirSlugOwner(slug) {
  return prisma.souvenir.findUnique({ where: { slug }, select: { id: true } });
}

/** Writes the product and replaces its destinations, sellers and photos in one sequential transaction. */
export function saveSouvenir(id, data, { destinationIds, sellers, photos }) {
  return prisma.$transaction(async (tx) => {
    const souvenir = id ? await tx.souvenir.update({ where: { id }, data, select: { id: true, slug: true } }) : await tx.souvenir.create({ data, select: { id: true, slug: true } });

    if (id) {
      await tx.souvenirDestination.deleteMany({ where: { souvenirId: id } });
      await tx.souvenirSeller.deleteMany({ where: { souvenirId: id } });
      await tx.souvenirPhoto.deleteMany({ where: { souvenirId: id } });
    }

    await tx.souvenirDestination.createMany({ data: destinationIds.map((destinationId) => ({ souvenirId: souvenir.id, destinationId })) });
    if (sellers.length) await tx.souvenirSeller.createMany({ data: sellers.map((seller) => ({ souvenirId: souvenir.id, sellerId: seller.sellerId, note: seller.note ?? null })) });
    if (photos.length) await tx.souvenirPhoto.createMany({ data: photos.map((photo, position) => ({ souvenirId: souvenir.id, url: photo.url, caption: photo.caption ?? null, kind: photo.kind, position })) });

    return souvenir;
  });
}

export function deleteSouvenir(id) {
  return prisma.souvenir.delete({ where: { id }, select: { id: true } });
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function listSouvenirCategories({ search, skip = 0, take = 50 } = {}) {
  const where = search ? { OR: [{ name: contains(search) }, { slug: contains(search) }] } : {};
  const [items, total] = await Promise.all([
    prisma.souvenirCategory.findMany({ where, include: { _count: { select: { souvenirs: true } } }, orderBy: { name: "asc" }, skip, take }),
    prisma.souvenirCategory.count({ where }),
  ]);
  return { items, total };
}

export function listAllSouvenirCategories() {
  return prisma.souvenirCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true, icon: true } });
}

export function countCategoryById(id) {
  return prisma.souvenirCategory.count({ where: { id } });
}

export function createSouvenirCategory(data) {
  return prisma.souvenirCategory.create({ data });
}

export function updateSouvenirCategory(id, data) {
  return prisma.souvenirCategory.update({ where: { id }, data });
}

export function countSouvenirsInCategory(id) {
  return prisma.souvenir.count({ where: { categoryId: id } });
}

export function deleteSouvenirCategory(id) {
  return prisma.souvenirCategory.delete({ where: { id }, select: { id: true } });
}

/** Categories that have at least one published souvenir, for public filters. */
export function listUsedSouvenirCategories() {
  return prisma.souvenirCategory.findMany({ where: { souvenirs: { some: { isPublished: true } } }, orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
}

/** Destinations that have at least one published souvenir, for public filters. */
export function listSouvenirDestinations() {
  return prisma.destination.findMany({
    where: { souvenirs: { some: { souvenir: { is: { isPublished: true } } } } },
    select: { id: true, name: true, slug: true, village: { select: { state: true } } },
    orderBy: { name: "asc" },
  });
}

/** Light destination lookup for souvenir relevance (id, name, coordinates, state). */
export function findDestinationForSouvenirs({ slug, id }) {
  return prisma.destination.findFirst({
    where: slug ? { slug } : { id },
    select: { id: true, name: true, slug: true, latitude: true, longitude: true, village: { select: { state: true } } },
  });
}

export function countDestinationsByIds(ids) {
  return prisma.destination.count({ where: { id: { in: ids } } });
}
