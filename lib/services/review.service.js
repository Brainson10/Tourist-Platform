import { forbiddenError, notFoundError } from "@/lib/api/errors";
import * as destinationRepository from "@/lib/repositories/destination.repository";
import * as reviewRepository from "@/lib/repositories/review.repository";
import { buildMeta, getPagination } from "@/lib/services/pagination";
import { getSettings } from "@/lib/services/settings.service";

async function refreshRatingCache(destinationId) {
  const summary = await reviewRepository.ratingSummary(destinationId);

  await destinationRepository.updateRatingCache(destinationId, {
    ratingAverage: Math.round(summary.average * 10) / 10,
    reviewCount: summary.count,
  });
}

async function requireDestination(destinationId) {
  const destination = await destinationRepository.findDestinationSummary(destinationId);

  if (!destination) {
    throw notFoundError("We couldn't find that destination");
  }

  return destination;
}

export async function getReviewSection(destinationId, userId = null, query = {}) {
  const { page, limit, skip } = getPagination(query, 6);
  const [{ reviews, total }, summary, userReview] = await Promise.all([
    reviewRepository.listApprovedReviews(destinationId, { skip, take: limit }),
    reviewRepository.ratingSummary(destinationId),
    userId ? reviewRepository.findUserReview(destinationId, userId) : null,
  ]);

  return {
    reviews: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      createdAt: review.createdAt,
      photos: review.photos?.map((photo) => photo.imageUrl) ?? [],
      author: { name: review.user?.fullName ?? "Traveler", avatar: review.user?.avatar ?? null },
    })),
    summary,
    userReview: userReview ? { ...userReview, photos: userReview.photos.map((photo) => photo.imageUrl) } : null,
    meta: buildMeta({ page, limit, total }),
  };
}

export async function submitReview({ destinationId, user, input }) {
  await requireDestination(destinationId);
  const { autoApproveReviews } = await getSettings();

  // Editing a review sends it back to moderation unless auto-approve is on.
  const review = await reviewRepository.upsertUserReview(
    destinationId,
    user.id,
    {
      rating: input.rating,
      title: input.title ?? null,
      comment: input.comment,
      status: autoApproveReviews ? "APPROVED" : "PENDING",
    },
    [...new Set(input.photos ?? [])]
  );

  await refreshRatingCache(destinationId);
  return review;
}

export async function deleteOwnReview({ destinationId, user }) {
  const review = await reviewRepository.findUserReview(destinationId, user.id);

  if (!review) {
    throw notFoundError("You haven't reviewed this destination");
  }

  if (review.userId !== user.id) {
    throw forbiddenError();
  }

  await reviewRepository.deleteReview(review.id);
  await refreshRatingCache(destinationId);
  return { id: review.id };
}

export async function moderateReview(id, status) {
  const review = await reviewRepository.findReviewById(id);

  if (!review) {
    throw notFoundError("Review not found");
  }

  const updated = await reviewRepository.updateReviewStatus(id, status);
  await refreshRatingCache(review.destinationId);
  return updated;
}

export async function deleteReviewAsAdmin(id) {
  const review = await reviewRepository.findReviewById(id);

  if (!review) {
    throw notFoundError("Review not found");
  }

  await reviewRepository.deleteReview(id);
  await refreshRatingCache(review.destinationId);
  return { id };
}

export async function listReviewsForAdmin(query = {}) {
  const { page, limit, skip } = getPagination(query, 20);
  const contains = (value) => ({ contains: value, mode: "insensitive" });
  const and = [];

  if (["PENDING", "APPROVED", "HIDDEN"].includes(query.status)) and.push({ status: query.status });
  if (query.destinationId) and.push({ destinationId: query.destinationId });
  if (query.search) {
    and.push({
      OR: [
        { title: contains(query.search) },
        { comment: contains(query.search) },
        { destination: { is: { name: contains(query.search) } } },
        { user: { is: { fullName: contains(query.search) } } },
      ],
    });
  }

  const { items, total } = await reviewRepository.listReviewsForAdmin({ where: and.length ? { AND: and } : {}, skip, take: limit });
  return { data: items, meta: buildMeta({ page, limit, total }) };
}

export function listReviewsForUser(userId) {
  return reviewRepository.listReviewsForUser(userId);
}

export function countReviewsForUser(userId) {
  return reviewRepository.countReviewsForUser(userId);
}

export function listRecentHighlights(take = 3) {
  return reviewRepository.listRecentApprovedReviews(take);
}
