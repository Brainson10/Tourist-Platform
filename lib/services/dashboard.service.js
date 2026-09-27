import { listExperiences } from "@/lib/services/experience.service";
import { listMyGuideRequests } from "@/lib/services/guide.service";
import { listFestivals } from "@/lib/services/festival.service";
import { getRecommendationsForUser } from "@/lib/services/recommendation.service";
import { listSaved } from "@/lib/services/saved.service";
import { listTrips } from "@/lib/services/trip.service";

export async function getDashboardData(user) {
  const [trips, saved, { recommendations, personalized }, festivals, experiences, guideRequests] = await Promise.all([
    listTrips(user.id),
    listSaved(user.id, 8),
    getRecommendationsForUser(user.id, 4),
    listFestivals({ limit: 3, when: "upcoming" }).then((result) => result.data),
    listExperiences({ limit: 4 }).then((result) => result.data),
    listMyGuideRequests(user),
  ]);

  const activeTrips = trips.filter((trip) => trip.phase === "upcoming" || trip.phase === "ongoing");

  return {
    nextTrip: activeTrips[0] ?? null,
    otherTrips: activeTrips.slice(1, 4),
    tripCount: trips.length,
    saved,
    recommendations,
    personalized,
    guideRequests: guideRequests.filter((request) => ["NEW", "ACCEPTED"].includes(request.status)),
    festivals,
    experiences,
  };
}
