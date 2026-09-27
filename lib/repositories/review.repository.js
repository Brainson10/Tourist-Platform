import prisma from "@/lib/db";

const reviewAuthor = { select: { id: true, fullName: true, avatar: true } };
const reviewPhotos = { orderBy: { position: "asc" }, select: { id: true, imageUrl: true } };

export async function listApprovedReviews(destinationId, { skip = 0, take = 10 } = {}) {
  const where = { destinationId, status: "APPROVED" };
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({ where, include: { user: reviewAuthor, photos: reviewPhotos }, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.review.count({ where }),
  ]);

  return { reviews, total };
}

export async function ratingSummary(destinationId) {
  const [aggregate, distribution] = await Promise.all([
    prisma.review.aggregate({ where: { destinationId, status: "APPROVED" }, _avg: { rating: true }, _count: { _all: true } }),
    prisma.review.groupBy({
      by: ["rating"],
      where: { destinationId, status: "APPROVED" },
      _count: { _all: true },
      orderBy: { rating: "desc" },
    }),
  ]);

  return {
    average: aggregate._avg.rating ?? 0,
    count: aggregate._count._all,
    distribution: distribution.map((row) => ({ rating: row.rating, count: row._count._all })),
  };
}

export function findUserReview(destinationId, userId) {
  return prisma.review.findUnique({ where: { destinationId_userId: { destinationId, userId } }, include: { photos: reviewPhotos } });
}

/** Creates or updates the traveler's review and replaces its photos as one unit. */
export function upsertUserReview(destinationId, userId, data, photoUrls = []) {
  return prisma.$transaction(async (tx) => {
    const review = await tx.review.upsert({
      where: { destinationId_userId: { destinationId, userId } },
      create: { ...data, destinationId, userId },
      update: data,
    });
    await tx.reviewPhoto.deleteMany({ where: { reviewId: review.id } });
    if (photoUrls.length) {
      await tx.reviewPhoto.createMany({ data: photoUrls.map((imageUrl, position) => ({ reviewId: review.id, imageUrl, position })) });
    }
    return review;
  });
}

export function deleteReview(id) {
  return prisma.review.delete({ where: { id }, select: { id: true, destinationId: true } });
}

export function findReviewById(id) {
  return prisma.review.findUnique({ where: { id }, select: { id: true, destinationId: true, userId: true } });
}

export function updateReviewStatus(id, status) {
  return prisma.review.update({ where: { id }, data: { status }, select: { id: true, destinationId: true, status: true } });
}

export function listReviewsForUser(userId, take = 20) {
  return prisma.review.findMany({
    where: { userId },
    include: { destination: { select: { name: true, slug: true } } },
    orderBy: { updatedAt: "desc" },
    take,
  });
}

export function countReviewsForUser(userId) {
  return prisma.review.count({ where: { userId } });
}

export function listRecentApprovedReviews(take = 3) {
  return prisma.review.findMany({
    where: { status: "APPROVED", rating: { gte: 4 } },
    include: { user: reviewAuthor, destination: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function listReviewsForAdmin({ where = {}, skip = 0, take = 20 }) {
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        destination: { select: { id: true, name: true, slug: true } },
        photos: reviewPhotos,
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip,
      take,
    }),
    prisma.review.count({ where }),
  ]);

  return { items, total };
}
