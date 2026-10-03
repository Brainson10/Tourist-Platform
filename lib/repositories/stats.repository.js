import prisma from "@/lib/db";

export async function countEverything() {
  const [destinations, villages, categories, experiences, festivals, stories, reviews, pendingReviews, users, trips, guides, pendingGuides, souvenirs] = await Promise.all([
    prisma.destination.count(),
    prisma.village.count(),
    prisma.category.count(),
    prisma.experience.count(),
    prisma.festival.count(),
    prisma.story.count(),
    prisma.review.count(),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
    prisma.trip.count(),
    prisma.guideProfile.count({ where: { status: "APPROVED" } }),
    prisma.guideProfile.count({ where: { status: "PENDING" } }),
    prisma.souvenir.count(),
  ]);

  return { destinations, villages, categories, experiences, festivals, stories, reviews, pendingReviews, users, trips, guides, pendingGuides, souvenirs };
}

export function findIncompleteDestinations(take = 5) {
  return prisma.destination.findMany({
    where: { OR: [{ coverImage: null }, { photos: { none: {} } }, { destinationCategories: { none: {} } }] },
    select: { id: true, name: true, coverImage: true, _count: { select: { photos: true, destinationCategories: true } } },
    take,
  });
}
