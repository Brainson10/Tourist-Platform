import { countDestinationsByState, getDestinationCards, getDestinationFilterOptions } from "@/lib/services/destination.service";
import { listExperiences } from "@/lib/services/experience.service";
import { listFestivals } from "@/lib/services/festival.service";
import { listGuides } from "@/lib/services/guide.service";
import { listRecentHighlights } from "@/lib/services/review.service";
import { getFeaturedSouvenirs } from "@/lib/services/souvenir.service";
import { listStories } from "@/lib/services/story.service";

const monthInIndia = new Intl.DateTimeFormat("en-IN", { month: "numeric", timeZone: "Asia/Kolkata" });

/** Everything the home page shows. Each section degrades to empty on failure. */
export async function getHomePageData() {
  const settle = (promise, fallback) =>
    promise.catch((error) => {
      console.error("[home] section failed", error);
      return fallback;
    });
  const month = Number(monthInIndia.format(new Date()));

  const [featured, topRated, bestNow, filters, stateCounts, experiences, festivals, stories, reviews, guides, souvenirs] = await Promise.all([
    settle(getDestinationCards({ featured: true, take: 7 }), []),
    settle(getDestinationCards({ sort: "rating", take: 12 }), []),
    settle(getDestinationCards({ month, sort: "rating", take: 4 }), []),
    settle(getDestinationFilterOptions(), { categories: [], locations: [] }),
    settle(countDestinationsByState(), {}),
    settle(listExperiences({ limit: 4 }).then((result) => result.data), []),
    settle(listFestivals({ limit: 24, when: "upcoming" }).then((result) => result.data), []),
    settle(listStories({ limit: 4 }).then((result) => result.data), []),
    settle(listRecentHighlights(3), []),
    settle(listGuides({ limit: 3 }).then((result) => result.data), []),
    settle(getFeaturedSouvenirs(4), []),
  ]);

  const popular = [...new Map([...featured, ...topRated].map((destination) => [destination.id, destination])).values()].slice(0, 5);
  const shownIds = new Set([...popular, ...bestNow].map((destination) => destination.id));
  const hiddenGems = topRated.filter((destination) => !shownIds.has(destination.id)).slice(0, 4);

  return {
    month,
    popular,
    bestNow,
    hiddenGems,
    categories: filters.categories,
    stateCounts,
    totalDestinations: Object.values(stateCounts).reduce((sum, count) => sum + count, 0),
    experiences,
    festivals,
    stories,
    reviews,
    guides,
    souvenirs,
  };
}
