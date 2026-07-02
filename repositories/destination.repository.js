import prisma from "@/lib/db";

const destinationInclude = {
  experiences: true,
  festivals: {
    orderBy: {
      startDate: "asc",
    },
  },
  stories: true,
  recommendations: true,
};

function pagination({ limit = 50, offset = 0 } = {}) {
  return {
    take: limit,
    skip: offset,
  };
}

function buildWhere(filters = {}) {
  const { state, district, category, tag, isFeatured, search } = filters;

  return {
    ...(state ? { state: { equals: state, mode: "insensitive" } } : {}),
    ...(district ? { district: { equals: district, mode: "insensitive" } } : {}),
    ...(category ? { categories: { has: category } } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(typeof isFeatured === "boolean" ? { isFeatured } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { shortDescription: { contains: search, mode: "insensitive" } },
            { fullDescription: { contains: search, mode: "insensitive" } },
            { state: { contains: search, mode: "insensitive" } },
            { district: { contains: search, mode: "insensitive" } },
            { tags: { has: search } },
            { categories: { has: search } },
          ],
        }
      : {}),
  };
}

function distanceKm(origin, destination) {
  const earthRadiusKm = 6371;
  const latDelta = ((destination.latitude - origin.latitude) * Math.PI) / 180;
  const lonDelta = ((destination.longitude - origin.longitude) * Math.PI) / 180;
  const originLat = (origin.latitude * Math.PI) / 180;
  const destinationLat = (destination.latitude * Math.PI) / 180;
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(originLat) *
      Math.cos(destinationLat) *
      Math.sin(lonDelta / 2) *
      Math.sin(lonDelta / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export async function findAll(filters = {}) {
  const { limit, offset, ...whereFilters } = filters;

  return prisma.destination.findMany({
    where: buildWhere(whereFilters),
    include: {
      experiences: true,
      festivals: true,
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    ...pagination({ limit, offset }),
  });
}

export async function findById(id) {
  return prisma.destination.findUnique({
    where: { id },
    include: destinationInclude,
  });
}

export async function findBySlug(slug) {
  return prisma.destination.findUnique({
    where: { slug },
    include: destinationInclude,
  });
}

export async function findFeatured(limit = 6) {
  return prisma.destination.findMany({
    where: {
      isFeatured: true,
    },
    include: {
      experiences: true,
      festivals: true,
    },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    take: limit,
  });
}

export async function search({ q, limit = 20, offset = 0, ...filters }) {
  return prisma.destination.findMany({
    where: buildWhere({
      ...filters,
      search: q,
    }),
    include: {
      experiences: true,
      festivals: true,
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    ...pagination({ limit, offset }),
  });
}

export async function findNearby({ latitude, longitude, radiusKm = 80, limit = 6, excludeSlug }) {
  const destinations = await prisma.destination.findMany({
    where: {
      ...(excludeSlug ? { slug: { not: excludeSlug } } : {}),
    },
    include: {
      experiences: true,
      festivals: true,
    },
  });

  return destinations
    .map((destination) => ({
      ...destination,
      distanceKm: distanceKm({ latitude, longitude }, destination),
    }))
    .filter((destination) => destination.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export async function findRelated(destination, limit = 3) {
  return prisma.destination.findMany({
    where: {
      slug: {
        not: destination.slug,
      },
      OR: [
        { state: destination.state },
        { district: destination.district },
        ...(destination.categories ?? []).map((category) => ({
          categories: { has: category },
        })),
        ...(destination.tags ?? []).map((tag) => ({
          tags: { has: tag },
        })),
      ],
    },
    include: {
      experiences: true,
      festivals: true,
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    take: limit,
  });
}

export async function create(data) {
  return prisma.destination.create({
    data,
  });
}

export async function update(id, data) {
  return prisma.destination.update({
    where: { id },
    data,
  });
}

export async function remove(id) {
  return prisma.destination.delete({
    where: { id },
  });
}
