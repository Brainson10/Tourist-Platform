import * as reviewRepository from "@/lib/repositories/review.repository";
import * as savedRepository from "@/lib/repositories/saved.repository";
import * as tripRepository from "@/lib/repositories/trip.repository";
import { getDestinationCards, toDestinationCard } from "@/lib/services/destination.service";
import { formatRating } from "@/lib/utils/format";

/**
 * Explainable, rule-based recommendations.
 *
 * Signals come from what the traveler did: saved places, trips and reviews
 * rated 4+. A candidate earns points for sharing categories (+3 each) or a
 * state (+2) with those places, plus a small boost for good ratings. Every
 * suggestion carries the strongest reason in plain language.
 */
export function scoreCandidates(candidates, signals) {
  return candidates
    .map((candidate) => {
      let score = 0;
      let reason = null;
      let reasonWeight = 0;

      for (const signal of signals) {
        const sharedCategory = candidate.categories.find((category) => signal.categorySlugs.includes(category.slug));

        if (sharedCategory) {
          score += 3;
          if (reasonWeight < 3) {
            reason = `Because you ${signal.verb} ${signal.name} · ${sharedCategory.name}`;
            reasonWeight = 3;
          }
        }

        if (candidate.village?.state && candidate.village.state === signal.state) {
          score += 2;
          if (reasonWeight < 2) {
            reason = `Also in ${signal.state}, like ${signal.name}`;
            reasonWeight = 2;
          }
        }
      }

      score += (candidate.ratingAverage || 0) * 0.5 + (candidate.isFeatured ? 0.5 : 0);

      if (!reason) {
        reason = candidate.reviewCount ? `Rated ${formatRating(candidate.ratingAverage)} by travelers` : "Popular with travelers";
      }

      return { ...candidate, score, reason };
    })
    .sort((first, second) => second.score - first.score);
}

export async function getRecommendationsForUser(userId, limit = 4) {
  const [saved, trips, reviews] = await Promise.all([
    savedRepository.listSavedDestinations(userId, 20),
    tripRepository.listTripsForUser(userId, { take: 20 }),
    reviewRepository.listReviewsForUser(userId, 20),
  ]);

  const signals = [];
  const excludeIds = new Set();

  for (const destination of saved.map(toDestinationCard)) {
    excludeIds.add(destination.id);
    signals.push({ verb: "saved", name: destination.name, state: destination.village?.state, categorySlugs: destination.categories.map((category) => category.slug) });
  }

  const plannedIds = new Set(trips.map((trip) => trip.destination?.id).filter(Boolean));
  const reviewedSlugs = new Set(reviews.filter((review) => review.rating >= 4).map((review) => review.destination.slug));
  const candidates = await getDestinationCards({ take: 40, sort: "rating" });

  // Planned and well-reviewed places are signals too, and shouldn't be suggested back.
  for (const candidate of candidates) {
    const verb = reviewedSlugs.has(candidate.slug) ? "enjoyed" : plannedIds.has(candidate.id) ? "planned a trip to" : null;
    if (!verb || excludeIds.has(candidate.id)) continue;
    excludeIds.add(candidate.id);
    signals.push({ verb, name: candidate.name, state: candidate.village?.state, categorySlugs: candidate.categories.map((category) => category.slug) });
  }

  for (const id of plannedIds) excludeIds.add(id);

  const recommendations = scoreCandidates(candidates.filter((candidate) => !excludeIds.has(candidate.id)), signals).slice(0, limit);
  return { recommendations, personalized: signals.length > 0 };
}
