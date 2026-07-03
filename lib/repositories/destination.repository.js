import prisma from "@/lib/db";

const destinationListInclude = {
  village: true,
  photos: {
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  },
  destinationCategories: {
    include: {
      category: true,
    },
  },
  experiences: true,
  festivals: {
    orderBy: {
      startDate: "asc",
    },
  },
};

const destinationDetailInclude = {
  ...destinationListInclude,
  stories: true,
  reviews: {
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
};

function categoryFilter(category) {
  return {
    destinationCategories: {
      some: {
        category: {
          is: {
            OR: [
              { name: { equals: category, mode: "insensitive" } },
              { slug: { equals: category, mode: "insensitive" } },
            ],
          },
        },
      },
    },
  };
}

export function buildDestinationWhere(filters = {}) {
  const { search, featured, isFeatured, village, villageId, district, category } = filters;
  const featuredFilter = typeof featured === "boolean" ? featured : isFeatured;

  return {
    ...(typeof featuredFilter === "boolean" ? { isFeatured: featuredFilter } : {}),
    ...(villageId ? { villageId } : {}),
    ...(village
      ? {
          village: {
            is: {
              name: {
                equals: village,
                mode: "insensitive",
              },
            },
          },
        }
      : {}),
    ...(district
      ? {
          OR: [
            { district: { equals: district, mode: "insensitive" } },
            {
              village: {
                is: {
                  district: {
                    equals: district,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        }
      : {}),
    ...(category ? categoryFilter(category) : {}),
    ...(search
      ? {
          AND: [
            {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { shortDescription: { contains: search, mode: "insensitive" } },
                { fullDescription: { contains: search, mode: "insensitive" } },
                { district: { contains: search, mode: "insensitive" } },
                { state: { contains: search, mode: "insensitive" } },
                { tags: { has: search } },
                {
                  village: {
                    is: {
                      OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { district: { contains: search, mode: "insensitive" } },
                      ],
                    },
                  },
                },
                {
                  destinationCategories: {
                    some: {
                      category: {
                        is: {
                          OR: [
                            { name: { contains: search, mode: "insensitive" } },
                            { slug: { contains: search, mode: "insensitive" } },
                          ],
                        },
                      },
                    },
                  },
                },
              ],
            },
          ],
        }
      : {}),
  };
}

export async function createDestination(data) {
  return prisma.destination.create({
    data,
    include: destinationDetailInclude,
  });
}

export async function getDestinationById(id) {
  return prisma.destination.findUnique({
    where: { id },
    include: destinationDetailInclude,
  });
}

export async function getDestinationBySlug(slug) {
  return prisma.destination.findUnique({
    where: { slug },
    include: destinationDetailInclude,
  });
}

export async function getDestinationBySlugOrId(value) {
  return prisma.destination.findFirst({
    where: {
      OR: [{ id: value }, { slug: value }],
    },
    include: destinationDetailInclude,
  });
}

export async function getAllDestinations({ where = {}, orderBy = [{ isFeatured: "desc" }, { name: "asc" }], skip = 0, take = 12 } = {}) {
  const [destinations, total] = await prisma.$transaction([
    prisma.destination.findMany({
      where,
      include: destinationListInclude,
      orderBy,
      skip,
      take,
    }),
    prisma.destination.count({ where }),
  ]);

  return { destinations, total };
}

export async function updateDestination(id, data) {
  return prisma.destination.update({
    where: { id },
    data,
    include: destinationDetailInclude,
  });
}

export async function deleteDestination(id) {
  return prisma.destination.delete({
    where: { id },
  });
}

export async function searchDestinations({ where = {}, orderBy = [{ isFeatured: "desc" }, { name: "asc" }], skip = 0, take = 12 } = {}) {
  const [destinations, total] = await prisma.$transaction([
    prisma.destination.findMany({
      where,
      include: destinationListInclude,
      orderBy,
      skip,
      take,
    }),
    prisma.destination.count({ where }),
  ]);

  return { destinations, total };
}

export async function getFeaturedDestinations(limit = 10) {
  return prisma.destination.findMany({
    where: {
      isFeatured: true,
    },
    include: destinationListInclude,
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    take: limit,
  });
}

export async function getNearbyDestinations({ minLatitude, maxLatitude, minLongitude, maxLongitude, excludeId, excludeSlug }) {
  return prisma.destination.findMany({
    where: {
      latitude: {
        gte: minLatitude,
        lte: maxLatitude,
      },
      longitude: {
        gte: minLongitude,
        lte: maxLongitude,
      },
      ...(excludeId ? { id: { not: excludeId } } : {}),
      ...(excludeSlug ? { slug: { not: excludeSlug } } : {}),
    },
    include: destinationListInclude,
  });
}

export async function getVillageById(id) {
  return prisma.village.findUnique({
    where: { id },
  });
}

export async function getVillageByNameAndDistrict(name, district) {
  return prisma.village.findUnique({
    where: {
      name_district: {
        name,
        district,
      },
    },
  });
}

export async function upsertVillage({ name, district, state, latitude, longitude, description }) {
  return prisma.village.upsert({
    where: {
      name_district: {
        name,
        district,
      },
    },
    update: {
      state,
      latitude,
      longitude,
      ...(description ? { description } : {}),
    },
    create: {
      name,
      district,
      state,
      latitude,
      longitude,
      ...(description ? { description } : {}),
    },
  });
}

export async function getDestinationSlugOwner(slug) {
  return prisma.destination.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
    },
  });
}

export async function getCategoriesByIds(ids) {
  if (!ids.length) {
    return [];
  }

  return prisma.category.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
}

export async function getCategoriesByNamesOrSlugs(values) {
  if (!values.length) {
    return [];
  }

  return prisma.category.findMany({
    where: {
      OR: values.flatMap((value) => [
        { name: { equals: value, mode: "insensitive" } },
        { slug: { equals: value, mode: "insensitive" } },
      ]),
    },
  });
}

export async function getAllVillages() {
  return prisma.village.findMany({
    orderBy: [{ district: "asc" }, { name: "asc" }],
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
}
