import { badRequest, conflictError, notFoundError } from "@/lib/api/errors";
import * as destinationRepository from "@/lib/repositories/destination.repository";
import { DESTINATION_ORDER } from "@/lib/repositories/destination.repository";
import { buildMeta, getPagination } from "@/lib/services/pagination";
import { boundingBox, distanceKm } from "@/lib/utils/geo";

function asList(value) {
  return Array.isArray(value) ? value : [];
}

/** Shape used by every destination card in the UI. */
export function toDestinationCard(destination) {
  if (!destination) return null;

  return {
    id: destination.id,
    name: destination.name,
    slug: destination.slug,
    shortDescription: destination.shortDescription,
    image: destination.coverImage ?? destination.photos?.[0]?.imageUrl ?? null,
    village: destination.village,
    categories: destination.destinationCategories?.map((item) => item.category) ?? [],
    ratingAverage: destination.ratingAverage ?? 0,
    reviewCount: destination.reviewCount ?? 0,
    isFeatured: destination.isFeatured,
    bestSeason: destination.bestSeason ?? null,
    bestMonths: destination.bestMonths ?? [],
    estimatedDuration: destination.estimatedDuration ?? null,
    experienceCount: destination._count?.experiences ?? 0,
    festivalCount: destination._count?.festivals ?? 0,
    latitude: destination.latitude,
    longitude: destination.longitude,
    ...(destination.distanceKm !== undefined ? { distanceKm: destination.distanceKm } : {}),
  };
}

function toDestinationDetail(destination) {
  const gallery = destination.photos.map((photo) => ({ url: photo.imageUrl, caption: photo.caption }));

  if (destination.coverImage && !gallery.some((photo) => photo.url === destination.coverImage)) {
    gallery.unshift({ url: destination.coverImage, caption: null });
  }

  return {
    ...destination,
    image: destination.coverImage ?? gallery[0]?.url ?? null,
    gallery,
    categories: destination.destinationCategories.map((item) => item.category),
    hotels: asList(destination.hotels),
    homestays: asList(destination.homestays),
    emergencyContacts: asList(destination.emergencyContacts),
  };
}

export async function listDestinations(query = {}) {
  const { page, limit, skip } = getPagination(query, 12);
  const where = destinationRepository.buildDestinationWhere({ ...query, search: query.search ?? query.q });
  const { destinations, total } = await destinationRepository.listDestinations({
    where,
    orderBy: DESTINATION_ORDER[query.sort] ?? DESTINATION_ORDER.recommended,
    skip,
    take: limit,
  });

  return { data: destinations.map(toDestinationCard), meta: buildMeta({ page, limit, total }) };
}

export async function getDestinationCards({ featured, sort = "recommended", take = 8, excludeIds = [], categorySlugs, state, month } = {}) {
  const where = {
    AND: [
      destinationRepository.buildDestinationWhere({ featured, state, month }),
      ...(excludeIds.length ? [{ id: { notIn: excludeIds } }] : []),
      ...(categorySlugs?.length ? [{ destinationCategories: { some: { category: { is: { slug: { in: categorySlugs } } } } } }] : []),
    ],
  };
  const destinations = await destinationRepository.findDestinationCards({ where, orderBy: DESTINATION_ORDER[sort], take });

  return destinations.map(toDestinationCard);
}

/** Every destination matching the filters (capped), for the map view. */
export async function listDestinationPoints(query = {}) {
  const where = destinationRepository.buildDestinationWhere({ ...query, search: query.search ?? query.q });
  const destinations = await destinationRepository.findDestinationCards({ where, orderBy: DESTINATION_ORDER[query.sort] ?? DESTINATION_ORDER.recommended, take: 500 });

  return destinations.map(toDestinationCard);
}

export async function getDestinationBySlug(slug) {
  const destination = await destinationRepository.findDestinationBySlug(slug);

  if (!destination) {
    throw notFoundError("We couldn't find that destination");
  }

  return toDestinationDetail(destination);
}

export async function getDestinationBySlugOrId(value) {
  const destination = await destinationRepository.findDestinationBySlugOrId(value);

  if (!destination) {
    throw notFoundError("We couldn't find that destination");
  }

  return toDestinationDetail(destination);
}

export async function getDestinationForAdmin(id) {
  const destination = await destinationRepository.findDestinationById(id);

  if (!destination) {
    throw notFoundError("Destination not found");
  }

  return toDestinationDetail(destination);
}

export async function getNearbyDestinations({ latitude, longitude, radiusKm = 80, limit = 6, excludeId } = {}) {
  const candidates = await destinationRepository.findDestinationsInBox({
    ...boundingBox({ latitude, longitude }, radiusKm),
    excludeId,
  });

  return candidates
    .map((destination) => ({ ...destination, distanceKm: distanceKm({ latitude, longitude }, destination) }))
    .filter((destination) => destination.distanceKm <= radiusKm)
    .sort((first, second) => first.distanceKm - second.distanceKm)
    .slice(0, limit)
    .map(toDestinationCard);
}

/**
 * Related destinations with a short, honest reason for each suggestion:
 * shared categories first, then the same state, then nearby.
 */
export async function getRelatedDestinations(destination, limit = 4) {
  const categorySlugs = destination.categories.map((category) => category.slug);
  const [sameCategory, sameState, nearby] = await Promise.all([
    categorySlugs.length ? getDestinationCards({ categorySlugs, excludeIds: [destination.id], take: limit, sort: "rating" }) : [],
    getDestinationCards({ state: destination.village.state, excludeIds: [destination.id], take: limit, sort: "rating" }),
    getNearbyDestinations({ latitude: destination.latitude, longitude: destination.longitude, radiusKm: 150, limit, excludeId: destination.id }),
  ]);

  const seen = new Set();
  const related = [];
  const add = (cards, reasonFor) => {
    for (const card of cards) {
      if (related.length >= limit || seen.has(card.id)) continue;
      seen.add(card.id);
      related.push({ ...card, reason: reasonFor(card) });
    }
  };

  add(nearby, (card) => `${Math.round(card.distanceKm)} km away`);
  add(sameCategory, (card) => {
    const shared = card.categories.find((category) => categorySlugs.includes(category.slug));
    return shared ? `Also great for ${shared.name.toLowerCase()}` : "Similar experience";
  });
  add(sameState, () => `Also in ${destination.village.state}`);

  return related;
}

export function getDestinationFilterOptions() {
  return Promise.all([destinationRepository.listCategoriesWithCounts(), destinationRepository.listLocationFacets()]).then(
    ([categories, locations]) => ({
      categories: categories.filter((category) => category._count.destinations > 0).map(({ id, name, slug, _count }) => ({ id, name, slug, count: _count.destinations })),
      locations,
    })
  );
}

export function countDestinationsByState() {
  return destinationRepository.countDestinationsByState();
}

export function listDestinationOptions() {
  return destinationRepository.listDestinationOptions();
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

async function assertUniqueSlug(slug, currentId = null) {
  const owner = await destinationRepository.findSlugOwner(slug);

  if (owner && owner.id !== currentId) {
    throw conflictError("Another destination already uses this URL slug", { fieldErrors: { slug: ["Already in use"] } });
  }
}

async function assertRelations({ villageId, categoryIds }) {
  if (!(await destinationRepository.villageExists(villageId))) {
    throw badRequest("Choose a village from the list", { fieldErrors: { villageId: ["Choose a village"] } });
  }

  const uniqueIds = [...new Set(categoryIds)];

  if (uniqueIds.length && (await destinationRepository.countCategoriesByIds(uniqueIds)) !== uniqueIds.length) {
    throw badRequest("One or more categories no longer exist", { fieldErrors: { categoryIds: ["Refresh and choose again"] } });
  }

  return uniqueIds;
}

function splitDestinationInput(input) {
  const { categoryIds, galleryImages, photos, tags, ...data } = input;

  return {
    data: { ...data, tags: tags.map((tag) => tag.toLowerCase()) },
    categoryIds,
    photos: [...new Map((photos ?? galleryImages.map((url) => ({ url, caption: null }))).map((photo) => [photo.url, photo])).values()],
  };
}

export async function createDestination(input) {
  await assertUniqueSlug(input.slug);
  const categoryIds = await assertRelations(input);
  const { data, photos } = splitDestinationInput(input);

  return destinationRepository.createDestination(data, { categoryIds, photos });
}

export async function updateDestination(id, input) {
  await getDestinationForAdmin(id);
  await assertUniqueSlug(input.slug, id);
  const categoryIds = await assertRelations(input);
  const { data, photos } = splitDestinationInput(input);

  return destinationRepository.updateDestination(id, data, { categoryIds, photos });
}

export async function deleteDestination(id) {
  await getDestinationForAdmin(id);
  return destinationRepository.deleteDestination(id);
}

export async function listDestinationsForAdmin(query = {}) {
  return listDestinations({ ...query, sort: query.sort ?? "name" });
}
