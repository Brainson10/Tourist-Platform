import * as searchRepository from "@/lib/repositories/search.repository";
import { countDestinationsByState } from "@/lib/services/destination.service";
import { formatDateRange, locationLabel } from "@/lib/utils/format";
import { rankMatches } from "@/lib/utils/search-rank";

// Small per-instance cache: suggestions are requested on every keystroke.
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_LIMIT = 300;
const cache = new Map();

function remember(key, value) {
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
  cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
  return value;
}

/** Grouped, ranked suggestions for the search box. */
export async function suggest(rawQuery) {
  const query = rawQuery.trim().replace(/\s+/g, " ");
  const key = query.toLowerCase();
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  const [destinations, experiences, festivals, stateCounts] = await Promise.all([
    searchRepository.searchDestinationCandidates(query),
    searchRepository.searchExperienceCandidates(query),
    searchRepository.searchFestivalCandidates(query),
    countDestinationsByState(),
  ]);

  const result = {
    destinations: rankMatches(destinations, query, {
      fields: [(item) => item.name, (item) => item.village?.name, (item) => item.village?.district, (item) => item.village?.state],
      popularity: (item) => item.ratingAverage * Math.log2(2 + item.reviewCount),
      limit: 5,
    }).map((item) => ({
      name: item.name,
      href: `/destinations/${item.slug}`,
      detail: locationLabel(item.village),
      image: item.coverImage ?? item.photos[0]?.imageUrl ?? null,
    })),
    experiences: rankMatches(experiences, query, { fields: [(item) => item.title, (item) => item.destination?.name], limit: 3 }).map((item) => ({
      name: item.title,
      href: `/experiences/${item.id}`,
      detail: item.destination?.name ?? "",
    })),
    festivals: rankMatches(festivals, query, { fields: [(item) => item.title, (item) => item.destination?.name], limit: 3 }).map((item) => ({
      name: item.title,
      href: `/festivals/${item.slug}`,
      detail: formatDateRange(item.startDate, item.endDate),
    })),
    states: rankMatches(
      Object.entries(stateCounts).filter(([, count]) => count > 0).map(([name, count]) => ({ name, count })),
      query,
      { fields: [(item) => item.name], popularity: (item) => item.count, limit: 2 }
    ).map((item) => ({ name: item.name, href: `/destinations?state=${encodeURIComponent(item.name)}`, detail: `${item.count} place${item.count === 1 ? "" : "s"}` })),
  };

  return remember(key, result);
}

const monthInIndia = new Intl.DateTimeFormat("en-IN", { month: "numeric", timeZone: "Asia/Kolkata" });

/** A random destination, weighted toward well-rated places that are in season right now. */
export async function pickSurprise(random = Math.random) {
  const candidates = await searchRepository.listSurpriseCandidates();
  if (!candidates.length) return null;

  const month = Number(monthInIndia.format(new Date()));
  const weights = candidates.map((candidate) => 1 + candidate.ratingAverage + (candidate.bestMonths.includes(month) ? 3 : 0));
  let target = random() * weights.reduce((sum, weight) => sum + weight, 0);

  for (let index = 0; index < candidates.length; index += 1) {
    target -= weights[index];
    if (target <= 0) return candidates[index].slug;
  }

  return candidates.at(-1).slug;
}
