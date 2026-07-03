import { badRequest, conflictError, notFoundError } from "@/lib/api/errors";
import * as destinationRepository from "@/lib/repositories/destination.repository";

const DESTINATION_FIELDS = [
  "name",
  "slug",
  "description",
  "shortDescription",
  "fullDescription",
  "state",
  "district",
  "villageId",
  "latitude",
  "longitude",
  "bestSeason",
  "openingHours",
  "estimatedDuration",
  "entryFee",
  "accessibility",
  "safetyInfo",
  "coverImage",
  "heroImage",
  "emergencyContacts",
  "tags",
  "history",
  "culture",
  "religion",
  "traditions",
  "language",
  "food",
  "thingsToDo",
  "nearbyAttractions",
  "transportation",
  "hotels",
  "homestays",
  "hiddenGems",
  "isFeatured",
];

function withoutUndefined(value) {
  return Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined));
}

function getPagination(query = {}) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 12;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function getSort(sort) {
  if (sort === "createdAt") {
    return [{ createdAt: "desc" }];
  }

  if (sort === "rating") {
    return [{ reviews: { _count: "desc" } }, { name: "asc" }];
  }

  return [{ name: "asc" }];
}

function distanceKm(origin, destination) {
  const earthRadiusKm = 6371;
  const latDelta = ((destination.latitude - origin.latitude) * Math.PI) / 180;
  const lonDelta = ((destination.longitude - origin.longitude) * Math.PI) / 180;
  const originLat = (origin.latitude * Math.PI) / 180;
  const destinationLat = (destination.latitude * Math.PI) / 180;
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function normalizeDestination(destination) {
  if (!destination) {
    return null;
  }

  const categoryObjects = destination.destinationCategories?.map((item) => item.category).filter(Boolean) ?? [];
  const photos = destination.photos ?? [];
  const galleryImages = photos.length
    ? photos.map((photo) => photo.imageUrl)
    : destination.coverImage
      ? [destination.coverImage]
      : [];

  return {
    ...destination,
    shortDescription: destination.shortDescription ?? destination.description,
    fullDescription: destination.fullDescription ?? destination.description,
    heroImage: destination.heroImage ?? destination.coverImage,
    photos,
    categoryObjects,
    categories: categoryObjects.map((category) => category.name),
    galleryImages,
    tags: destination.tags ?? [],
    thingsToDo: destination.thingsToDo ?? [],
    nearbyAttractions: destination.nearbyAttractions ?? [],
    hiddenGems: destination.hiddenGems ?? [],
  };
}

function normalizeList(destinations) {
  return destinations.map(normalizeDestination);
}

function buildMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

async function assertVillageExists(villageId) {
  const village = await destinationRepository.getVillageById(villageId);

  if (!village) {
    throw notFoundError("Village not found");
  }

  return village;
}

async function resolveVillage(data, currentDestination = null) {
  if (data.villageId) {
    return assertVillageExists(data.villageId);
  }

  if (data.villageName) {
    const village = await destinationRepository.upsertVillage({
      name: data.villageName,
      district: data.district,
      state: data.state,
      latitude: data.latitude,
      longitude: data.longitude,
      description: `Tourism service village for ${data.villageName}.`,
    });

    return village;
  }

  if (currentDestination?.villageId) {
    return currentDestination.village;
  }

  throw badRequest("Village name is required");
}

async function assertSlugAvailable(slug, currentDestinationId = null) {
  if (!slug) {
    return;
  }

  const existingDestination = await destinationRepository.getDestinationSlugOwner(slug);

  if (existingDestination && existingDestination.id !== currentDestinationId) {
    throw conflictError("Destination slug already exists");
  }
}

async function resolveCategories(data) {
  const ids = data.categoryIds ?? [];
  const namesOrSlugs = data.categories ?? [];

  if (!ids.length && !namesOrSlugs.length) {
    return null;
  }

  const [categoriesById, categoriesByNameOrSlug] = await Promise.all([
    destinationRepository.getCategoriesByIds(ids),
    destinationRepository.getCategoriesByNamesOrSlugs(namesOrSlugs),
  ]);
  const categories = [...categoriesById, ...categoriesByNameOrSlug];
  const uniqueCategories = Array.from(new Map(categories.map((category) => [category.id, category])).values());

  if (uniqueCategories.length !== new Set([...ids, ...namesOrSlugs]).size) {
    throw badRequest("One or more destination categories do not exist");
  }

  return uniqueCategories;
}

function buildPhotoCreateMany(galleryImages = [], coverImage) {
  const imageUrls = galleryImages.length ? galleryImages : coverImage ? [coverImage] : [];

  return imageUrls.map((imageUrl, index) => ({
    imageUrl,
    isCover: index === 0,
    displayOrder: index,
  }));
}

async function buildDestinationData(data, { currentDestination = null, replaceRelations = false } = {}) {
  const nextData = {};

  for (const field of DESTINATION_FIELDS) {
    if (data[field] !== undefined) {
      nextData[field] = data[field];
    }
  }

  const village = await resolveVillage(data, currentDestination);

  if (village) {
    nextData.villageId = village.id;
    nextData.state = data.state ?? village.state;
    nextData.district = data.district ?? village.district;
  }

  const categories = await resolveCategories(data);
  const relationData = {};

  if (categories) {
    relationData.destinationCategories = {
      ...(replaceRelations ? { deleteMany: {} } : {}),
      create: categories.map((category) => ({
        categoryId: category.id,
      })),
    };
  }

  if (data.galleryImages !== undefined) {
    const photos = buildPhotoCreateMany(data.galleryImages, data.coverImage);

    relationData.photos = {
      ...(replaceRelations ? { deleteMany: {} } : {}),
      ...(photos.length ? { create: photos } : {}),
    };
  }

  return withoutUndefined({
    ...nextData,
    ...relationData,
  });
}

export async function createDestination(data) {
  await assertSlugAvailable(data.slug);
  const destinationData = await buildDestinationData(data);
  const destination = await destinationRepository.createDestination(destinationData);

  return normalizeDestination(destination);
}

export async function getDestinationById(id) {
  const destination = await destinationRepository.getDestinationById(id);

  if (!destination) {
    throw notFoundError("Destination not found");
  }

  return normalizeDestination(destination);
}

export async function getDestinationBySlug(slug) {
  const destination = await destinationRepository.getDestinationBySlug(slug);

  if (!destination) {
    throw notFoundError("Destination not found");
  }

  return normalizeDestination(destination);
}

export async function getDestinationBySlugOrId(value) {
  const destination = await destinationRepository.getDestinationBySlugOrId(value);

  if (!destination) {
    throw notFoundError("Destination not found");
  }

  return normalizeDestination(destination);
}

export async function listDestinationCollection(query = {}) {
  const { page, limit, skip } = getPagination(query);
  const where = destinationRepository.buildDestinationWhere(query);
  const orderBy = getSort(query.sort);
  const { destinations, total } = await destinationRepository.getAllDestinations({
    where,
    orderBy,
    skip,
    take: limit,
  });

  return {
    data: normalizeList(destinations),
    meta: buildMeta({ page, limit, total }),
  };
}

export async function listDestinations(query = {}) {
  const result = await listDestinationCollection(query);

  return result.data;
}

export async function updateDestination(id, data) {
  const currentDestination = await getDestinationById(id);

  await assertSlugAvailable(data.slug, id);
  const destinationData = await buildDestinationData(data, {
    currentDestination,
    replaceRelations: true,
  });
  const destination = await destinationRepository.updateDestination(id, destinationData);

  return normalizeDestination(destination);
}

export async function deleteDestination(id) {
  await getDestinationById(id);

  return destinationRepository.deleteDestination(id);
}

export async function searchDestinations(query = {}) {
  const search = query.q ?? query.search;
  const { page, limit, skip } = getPagination(query);
  const where = destinationRepository.buildDestinationWhere({
    ...query,
    search,
  });
  const { destinations, total } = await destinationRepository.searchDestinations({
    where,
    orderBy: getSort(query.sort),
    skip,
    take: limit,
  });

  return {
    results: normalizeList(destinations),
    aiSuggestions: search
      ? [
          {
            title: "Plan around experiences",
            description: "Use interests like food, culture, wildlife, festivals, or slow travel to refine this search.",
          },
        ]
      : [],
    meta: buildMeta({ page, limit, total }),
  };
}

export async function getFeaturedDestinations(limit = 10) {
  const destinations = await destinationRepository.getFeaturedDestinations(limit);

  return normalizeList(destinations);
}

export async function getNearbyDestinations(query = {}) {
  const latitude = query.latitude;
  const longitude = query.longitude;
  const radiusKm = query.radiusKm ?? query.radius ?? 50;
  const limit = query.limit ?? 10;
  const latitudeDelta = radiusKm / 111;
  const longitudeDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180) || 1);
  const candidates = await destinationRepository.getNearbyDestinations({
    minLatitude: latitude - latitudeDelta,
    maxLatitude: latitude + latitudeDelta,
    minLongitude: longitude - longitudeDelta,
    maxLongitude: longitude + longitudeDelta,
    excludeId: query.excludeId,
    excludeSlug: query.excludeSlug,
  });

  return normalizeList(
    candidates
      .map((destination) => ({
        ...destination,
        distanceKm: Number(distanceKm({ latitude, longitude }, destination).toFixed(2)),
      }))
      .filter((destination) => destination.distanceKm <= radiusKm)
      .sort((first, second) => first.distanceKm - second.distanceKm)
      .slice(0, limit)
  );
}

export async function filterDestinations(filters = {}) {
  if (filters.latitude && filters.longitude) {
    return getNearbyDestinations(filters);
  }

  return listDestinations(filters);
}

export async function getDestinationPageData(slug) {
  const destination = await getDestinationBySlug(slug);
  const [relatedResult, nearbyDestinations] = await Promise.all([
    listDestinationCollection({
      district: destination.district,
      limit: 3,
    }),
    getNearbyDestinations({
      latitude: destination.latitude,
      longitude: destination.longitude,
      radiusKm: 120,
      limit: 3,
      excludeSlug: destination.slug,
    }),
  ]);

  return {
    destination,
    relatedDestinations: relatedResult.data.filter((item) => item.id !== destination.id).slice(0, 3),
    nearbyDestinations,
  };
}

export async function getDestinationAdminOptions() {
  const [villages, categories] = await Promise.all([
    destinationRepository.getAllVillages(),
    destinationRepository.getAllCategories(),
  ]);

  return {
    villages,
    categories,
  };
}
