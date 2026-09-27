import prisma from "@/lib/db";

const contains = (value) => ({ contains: value, mode: "insensitive" });

/** Broad candidate sets; ranking happens in the service. Each word must match somewhere. */
export function searchDestinationCandidates(query, take = 25) {
  const words = query.split(/\s+/).filter(Boolean).slice(0, 4);

  return prisma.destination.findMany({
    where: {
      AND: words.map((word) => ({
        OR: [
          { name: contains(word) },
          { tags: { has: word.toLowerCase() } },
          { village: { is: { OR: [{ name: contains(word) }, { district: contains(word) }, { state: contains(word) }] } } },
        ],
      })),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      coverImage: true,
      ratingAverage: true,
      reviewCount: true,
      photos: { orderBy: { displayOrder: "asc" }, take: 1, select: { imageUrl: true } },
      village: { select: { name: true, district: true, state: true } },
    },
    take,
  });
}

export function searchExperienceCandidates(query, take = 15) {
  return prisma.experience.findMany({
    where: { OR: [{ title: contains(query) }, { destination: { is: { name: contains(query) } } }] },
    select: { id: true, title: true, category: true, destination: { select: { name: true } } },
    take,
  });
}

export function searchFestivalCandidates(query, take = 15) {
  return prisma.festival.findMany({
    where: { OR: [{ title: contains(query) }, { destination: { is: { name: contains(query) } } }] },
    select: { id: true, slug: true, title: true, startDate: true, endDate: true, destination: { select: { name: true } } },
    take,
  });
}

export function listSurpriseCandidates(take = 200) {
  return prisma.destination.findMany({ select: { slug: true, ratingAverage: true, bestMonths: true }, take });
}
