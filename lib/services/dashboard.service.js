import { listDestinations } from "@/services/destination";
import { listExperiences } from "@/services/experience";
import { listFestivals } from "@/services/festival";
import { getRecommendationHighlights, listRecommendationsForUser } from "@/services/recommendation";
import { listTripsForUser } from "@/services/trip";

function getDestinationImage(destination) {
  return destination?.heroImage ?? destination?.coverImage ?? destination?.galleryImages?.[0] ?? destination?.photos?.[0]?.imageUrl ?? "";
}

function normalizeRecommendation(recommendation) {
  const destination = recommendation.destination;
  const categoryObjects = destination.destinationCategories?.map((item) => item.category).filter(Boolean) ?? [];
  const photos = destination.photos ?? [];

  return {
    id: recommendation.id,
    score: recommendation.score,
    reason: recommendation.reason,
    destination: {
      ...destination,
      image: getDestinationImage(destination),
      categories: categoryObjects.map((category) => category.name),
      galleryImages: photos.map((photo) => photo.imageUrl),
    },
  };
}

function getTripWindow(trip) {
  if (!trip) {
    return null;
  }

  const start = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(trip.startDate);
  const end = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(trip.endDate);

  return `${start} - ${end}`;
}

export async function getDashboardData(user) {
  const [destinationResult, featuredDestinations, experiences, festivals, trips, recommendations] = await Promise.all([
    listDestinations({ limit: 9, sort: "createdAt" }),
    listDestinations({ limit: 3, isFeatured: true }),
    listExperiences({ limit: 6 }),
    listFestivals({ limit: 5 }),
    listTripsForUser(user.id, { limit: 5 }),
    listRecommendationsForUser(user.id, { limit: 4 }),
  ]);

  const destinations = destinationResult ?? [];
  const activeTrips = trips.filter((trip) => ["PLANNING", "ACTIVE"].includes(trip.status));
  const upcomingTrip = activeTrips[0] ?? null;
  const spotlightDestination = featuredDestinations[0] ?? destinations[0] ?? null;

  return {
    user,
    destinations,
    featuredDestinations,
    spotlightDestination,
    experiences,
    festivals,
    trips,
    activeTrips,
    upcomingTrip,
    upcomingTripWindow: getTripWindow(upcomingTrip),
    recommendations: recommendations.map(normalizeRecommendation),
    recommendationHighlights: getRecommendationHighlights(),
    metrics: {
      destinations: destinations.length,
      featuredDestinations: featuredDestinations.length,
      experiences: experiences.length,
      festivals: festivals.length,
      trips: activeTrips.length,
    },
  };
}
