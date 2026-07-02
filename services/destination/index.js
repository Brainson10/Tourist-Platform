import { notFoundError } from "@/lib/api/errors";
import * as destinationRepository from "@/repositories/destination.repository";

function normalizeDestination(destination) {
  if (!destination) {
    return null;
  }

  return {
    ...destination,
    shortDescription: destination.shortDescription ?? destination.description,
    fullDescription: destination.fullDescription ?? destination.description,
    heroImage: destination.heroImage ?? destination.coverImage,
    galleryImages: destination.galleryImages?.length
      ? destination.galleryImages
      : destination.coverImage
        ? [destination.coverImage]
        : [],
    categories: destination.categories ?? [],
    tags: destination.tags ?? [],
    thingsToDo: destination.thingsToDo ?? [],
    nearbyAttractions: destination.nearbyAttractions ?? [],
    hiddenGems: destination.hiddenGems ?? [],
  };
}

function normalizeList(destinations) {
  return destinations.map(normalizeDestination);
}

export async function listDestinations(filters = {}) {
  const destinations = await destinationRepository.findAll(filters);

  return normalizeList(destinations);
}

export async function getFeaturedDestinations(limit = 6) {
  const destinations = await destinationRepository.findFeatured(limit);

  return normalizeList(destinations);
}

export async function searchDestinations(query) {
  const destinations = await destinationRepository.search(query);

  return {
    results: normalizeList(destinations),
    aiSuggestions: [
      {
        title: "Plan around experiences",
        description:
          "Use interests like food, culture, wildlife, festivals, or slow travel to refine this search.",
      },
    ],
  };
}

export async function filterDestinations(filters = {}) {
  if (filters.latitude && filters.longitude && filters.radiusKm) {
    return normalizeList(
      await destinationRepository.findNearby({
        latitude: filters.latitude,
        longitude: filters.longitude,
        radiusKm: filters.radiusKm,
        limit: filters.limit,
      })
    );
  }

  return listDestinations(filters);
}

export async function getDestinationById(id) {
  const destination = await destinationRepository.findById(id);

  if (!destination) {
    throw notFoundError("Destination not found");
  }

  return normalizeDestination(destination);
}

export async function getDestinationBySlug(slug) {
  const destination = await destinationRepository.findBySlug(slug);

  if (!destination) {
    throw notFoundError("Destination not found");
  }

  return normalizeDestination(destination);
}

export async function getDestinationPageData(slug) {
  const destination = await getDestinationBySlug(slug);
  const [relatedDestinations, nearbyDestinations] = await Promise.all([
    destinationRepository.findRelated(destination, 3),
    destinationRepository.findNearby({
      latitude: destination.latitude,
      longitude: destination.longitude,
      radiusKm: 120,
      limit: 3,
      excludeSlug: destination.slug,
    }),
  ]);

  return {
    destination,
    relatedDestinations: normalizeList(relatedDestinations),
    nearbyDestinations: normalizeList(nearbyDestinations),
  };
}

export async function createDestination(data) {
  const destination = await destinationRepository.create(data);

  return normalizeDestination(destination);
}

export async function updateDestination(id, data) {
  await getDestinationById(id);
  const destination = await destinationRepository.update(id, data);

  return normalizeDestination(destination);
}

export async function deleteDestination(id) {
  await getDestinationById(id);

  return destinationRepository.remove(id);
}
