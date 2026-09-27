import prisma from "@/lib/db";

const destinationSummary = {
  select: {
    id: true,
    name: true,
    slug: true,
    coverImage: true,
    shortDescription: true,
    village: { select: { name: true, district: true, state: true } },
  },
};

const contains = (value) => ({ contains: value, mode: "insensitive" });

export function buildStoryWhere({ search, destinationId } = {}) {
  const and = [];

  if (destinationId) and.push({ destinationId });
  if (search) {
    and.push({ OR: [{ title: contains(search) }, { excerpt: contains(search) }, { content: contains(search) }, { destination: { is: { name: contains(search) } } }] });
  }

  return and.length ? { AND: and } : {};
}

export async function listStories({ where = {}, skip = 0, take = 12 } = {}) {
  const [items, total] = await Promise.all([
    prisma.story.findMany({ where, include: { destination: destinationSummary }, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.story.count({ where }),
  ]);

  return { items, total };
}

export function findStoryBySlug(slug) {
  return prisma.story.findUnique({ where: { slug }, include: { destination: destinationSummary } });
}

export function findStoryById(id) {
  return prisma.story.findUnique({ where: { id }, include: { destination: destinationSummary } });
}

export function findMoreStories({ id, destinationId, take = 3 }) {
  return prisma.story.findMany({
    where: { id: { not: id } },
    include: { destination: destinationSummary },
    orderBy: [{ createdAt: "desc" }],
    take: take + 3,
  }).then((stories) =>
    // Same destination first, then the newest others.
    [...stories.filter((story) => story.destinationId === destinationId), ...stories.filter((story) => story.destinationId !== destinationId)].slice(0, take)
  );
}

export function findSlugOwner(slug) {
  return prisma.story.findUnique({ where: { slug }, select: { id: true } });
}

export function createStory(data) {
  return prisma.story.create({ data });
}

export function updateStory(id, data) {
  return prisma.story.update({ where: { id }, data });
}

export function deleteStory(id) {
  return prisma.story.delete({ where: { id }, select: { id: true } });
}
