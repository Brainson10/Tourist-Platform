import prisma from "@/lib/db";

const RESOURCE_MODELS = {
  villages: prisma.village,
  categories: prisma.category,
  festivals: prisma.festival,
  experiences: prisma.experience,
  stories: prisma.story,
  reviews: prisma.review,
  users: prisma.user,
};

const RESOURCE_INCLUDES = {
  festivals: { destination: { select: { id: true, name: true } } },
  experiences: { destination: { select: { id: true, name: true } } },
  stories: { destination: { select: { id: true, name: true } } },
  reviews: {
    destination: { select: { id: true, name: true } },
    user: { select: { id: true, fullName: true, email: true } },
  },
};

const RESOURCE_ORDER = {
  villages: [{ district: "asc" }, { name: "asc" }],
  categories: [{ name: "asc" }],
  festivals: [{ startDate: "desc" }],
  experiences: [{ title: "asc" }],
  stories: [{ createdAt: "desc" }],
  reviews: [{ createdAt: "desc" }],
  users: [{ createdAt: "desc" }],
};

function getModel(resource) {
  return RESOURCE_MODELS[resource];
}

export function buildResourceWhere(resource, filters = {}) {
  const { search, destinationId, category, status, role, isBlocked, district } = filters;

  if (resource === "villages") {
    return {
      ...(district ? { district: { equals: district, mode: "insensitive" } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { district: { contains: search, mode: "insensitive" } },
              { state: { contains: search, mode: "insensitive" } },
              { pincode: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }

  if (resource === "categories") {
    return search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};
  }

  if (resource === "festivals") {
    return {
      ...(destinationId ? { destinationId } : {}),
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }

  if (resource === "experiences") {
    return {
      ...(destinationId ? { destinationId } : {}),
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { difficulty: { contains: search, mode: "insensitive" } },
              { duration: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }

  if (resource === "stories") {
    return {
      ...(destinationId ? { destinationId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
              { language: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }

  if (resource === "reviews") {
    return {
      ...(destinationId ? { destinationId } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { comment: { contains: search, mode: "insensitive" } },
              { destination: { is: { name: { contains: search, mode: "insensitive" } } } },
              { user: { is: { fullName: { contains: search, mode: "insensitive" } } } },
            ],
          }
        : {}),
    };
  }

  if (resource === "users") {
    return {
      ...(role ? { role } : {}),
      ...(typeof isBlocked === "boolean" ? { isBlocked } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }

  return {};
}

export async function countAdminStats() {
  const [destinations, villages, categories, festivals, experiences, stories, reviews, users] = await prisma.$transaction([
    prisma.destination.count(),
    prisma.village.count(),
    prisma.category.count(),
    prisma.festival.count(),
    prisma.experience.count(),
    prisma.story.count(),
    prisma.review.count(),
    prisma.user.count(),
  ]);

  return { destinations, villages, categories, festivals, experiences, stories, reviews, users };
}

export async function listResource(resource, { where = {}, skip = 0, take = 12 } = {}) {
  const model = getModel(resource);
  const [items, total] = await prisma.$transaction([
    model.findMany({
      where,
      ...(RESOURCE_INCLUDES[resource] ? { include: RESOURCE_INCLUDES[resource] } : {}),
      orderBy: RESOURCE_ORDER[resource] ?? [{ createdAt: "desc" }],
      skip,
      take,
    }),
    model.count({ where }),
  ]);

  return { items, total };
}

export async function getResourceById(resource, id) {
  return getModel(resource).findUnique({
    where: { id },
    ...(RESOURCE_INCLUDES[resource] ? { include: RESOURCE_INCLUDES[resource] } : {}),
  });
}

export async function createResource(resource, data) {
  return getModel(resource).create({
    data,
    ...(RESOURCE_INCLUDES[resource] ? { include: RESOURCE_INCLUDES[resource] } : {}),
  });
}

export async function updateResource(resource, id, data) {
  return getModel(resource).update({
    where: { id },
    data,
    ...(RESOURCE_INCLUDES[resource] ? { include: RESOURCE_INCLUDES[resource] } : {}),
  });
}

export async function deleteResource(resource, id) {
  return getModel(resource).delete({
    where: { id },
  });
}

export async function listDestinationOptions() {
  return prisma.destination.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getPlatformSettings() {
  return prisma.platformSetting.findUnique({
    where: { key: "admin-cms" },
  });
}

export async function upsertPlatformSettings(value) {
  return prisma.platformSetting.upsert({
    where: { key: "admin-cms" },
    update: { value },
    create: {
      key: "admin-cms",
      value,
    },
  });
}
