import { AUDIENCES, INTERESTS, labelOf } from "@/lib/constants/souvenirs";

/**
 * How an item's approximate price sits in a budget band:
 * "full" (entirely inside), "partial" (overlaps), "none" (outside) or "unknown" (no price listed).
 */
export function budgetFit(item, band) {
  if (!band) return null;
  if (item.priceMin == null && item.priceMax == null) return "unknown";

  const low = item.priceMin ?? item.priceMax;
  const high = item.priceMax ?? item.priceMin;
  const bandMax = band.max ?? Number.POSITIVE_INFINITY;

  if (low >= band.min && high <= bandMax) return "full";
  if (low <= bandMax && high >= band.min) return "partial";
  return "none";
}

const QUALITY_BONUS = new Set(["TRADITIONAL", "HANDMADE", "REGIONAL_SPECIALTY"]);

/**
 * Rule-based, explainable souvenir ranking.
 *
 * Relevance comes first: items linked to the destination (+5), then items from the same state (+2).
 * When a destination or state is given, items from other states are left out entirely.
 * Then: budget fit (+3 full, +1 partial, excluded when outside the chosen band), audience (+3),
 * interest (+3), traditional/handmade/regional badges (+0.5 each, max +1.5), year-round (+0.5),
 * featured (+0.5). Every result carries the reasons it was chosen.
 *
 * `items`: [{ id, name, isFeatured, availability, qualities, audiences, interests, priceMin, priceMax,
 *             destinations: [{ id, name, state }] }]
 */
export function rankSouvenirs(items, { destinationId, state, band, audience, interest } = {}, { limit = 6 } = {}) {
  const scoped = Boolean(destinationId || state);
  const ranked = [];

  for (const item of items) {
    let score = 0;
    const reasons = [];
    const here = destinationId ? item.destinations.find((destination) => destination.id === destinationId) : null;
    const regional = state ? item.destinations.find((destination) => destination.state === state) : null;

    if (here) {
      score += 5;
      reasons.push(`From ${here.name}`);
    } else if (regional) {
      score += 2;
      reasons.push(`Made in ${state}`);
    } else if (scoped) {
      continue;
    }

    const fit = budgetFit(item, band);
    if (fit === "none") continue;
    if (fit === "full") {
      score += 3;
      reasons.push(`Fits ${band.label}`);
    } else if (fit === "partial") {
      score += 1;
      reasons.push("Partly in your budget");
    } else if (fit === "unknown") {
      reasons.push("Price varies — ask locally");
    }

    if (audience && item.audiences.includes(audience)) {
      score += 3;
      reasons.push(AUDIENCES.find((entry) => entry.value === audience)?.tag ?? labelOf(AUDIENCES, audience));
    }

    if (interest && item.interests.includes(interest)) {
      score += 3;
      reasons.push(`For ${labelOf(INTERESTS, interest).toLowerCase()} lovers`);
    }

    score += Math.min(1.5, item.qualities.filter((quality) => QUALITY_BONUS.has(quality)).length * 0.5);
    if (item.availability === "YEAR_ROUND") score += 0.5;
    if (item.isFeatured) score += 0.5;

    ranked.push({ item, score, reasons });
  }

  return ranked
    .sort((first, second) => second.score - first.score || Number(second.item.isFeatured) - Number(first.item.isFeatured) || first.item.name.localeCompare(second.item.name))
    .slice(0, limit);
}
