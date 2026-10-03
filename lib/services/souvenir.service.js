import { badRequest, conflictError, notFoundError } from "@/lib/api/errors";
import { PHOTO_KINDS, budgetBand, labelOf } from "@/lib/constants/souvenirs";
import * as sellerRepository from "@/lib/repositories/seller.repository";
import * as souvenirRepository from "@/lib/repositories/souvenir.repository";
import { buildMeta, getPagination } from "@/lib/services/pagination";
import { distanceKm } from "@/lib/utils/geo";
import { rankSouvenirs } from "@/lib/utils/souvenir-rank";

function nearestSeller(sellers, origin) {
  if (!origin || !sellers.length) return null;
  return sellers
    .map(({ seller }) => ({ id: seller.id, name: seller.name, kind: seller.kind, distanceKm: distanceKm(origin, seller) }))
    .sort((first, second) => first.distanceKm - second.distanceKm)[0];
}

/** Card shape shared by every list. `origin` ({ latitude, longitude }) adds the nearest place to buy. */
export function toSouvenirCard(row, origin = null) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.shortDescription,
    priceMin: row.priceMin,
    priceMax: row.priceMax,
    audiences: row.audiences,
    interests: row.interests,
    qualities: row.qualities,
    availability: row.availability,
    isFeatured: row.isFeatured,
    isPublished: row.isPublished,
    needsVerification: row.needsVerification,
    image: row.coverImage ?? row.photos?.[0]?.url ?? null,
    category: row.category,
    destinations: row.destinations.map(({ destination }) => ({ id: destination.id, name: destination.name, slug: destination.slug, state: destination.village?.state })),
    sellerCount: row.sellers.length,
    nearestSeller: nearestSeller(row.sellers, origin),
  };
}

function toFilters(query) {
  return {
    q: query.q,
    destinationSlug: query.destination,
    state: query.state,
    categorySlug: query.category,
    band: budgetBand(query.budget),
    audience: query.for,
    quality: query.quality,
    interest: query.interest,
  };
}

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export async function listSouvenirs(query = {}) {
  const { page, limit, skip } = getPagination(query, 12);
  const { items, total } = await souvenirRepository.listSouvenirs({ where: souvenirRepository.buildSouvenirWhere(toFilters(query)), skip, take: limit });
  return { data: items.map((row) => toSouvenirCard(row)), meta: buildMeta({ page, limit, total }) };
}

/** Featured souvenirs first, filled up with others so the home strip is never half empty. */
export async function getFeaturedSouvenirs(limit = 4) {
  const rows = await souvenirRepository.findSouvenirCards({ where: { isPublished: true }, take: limit });
  return rows.map((row) => toSouvenirCard(row));
}

/** Filter options that only list values that actually have souvenirs. */
export async function getSouvenirFilterOptions() {
  const [categories, destinations] = await Promise.all([souvenirRepository.listUsedSouvenirCategories(), souvenirRepository.listSouvenirDestinations()]);
  const byState = new Map();

  for (const destination of destinations) {
    const state = destination.village?.state ?? "Other";
    byState.set(state, [...(byState.get(state) ?? []), { name: destination.name, slug: destination.slug }]);
  }

  return { categories, destinationGroups: [...byState.entries()].sort(([first], [second]) => first.localeCompare(second)).map(([state, items]) => ({ state, destinations: items })) };
}

export async function getSouvenir(slug) {
  const row = await souvenirRepository.findSouvenirBySlug(slug);
  if (!row || !row.isPublished) throw notFoundError("We couldn't find that local treasure");

  const destinations = row.destinations.map(({ destination }) => destination);
  const origin = destinations[0] ?? null;
  const sellers = row.sellers
    .map(({ seller, note }) => ({ ...seller, note, distanceKm: origin ? distanceKm(origin, seller) : null, from: origin?.name ?? null }))
    .sort((first, second) => (first.distanceKm ?? 0) - (second.distanceKm ?? 0));

  // Cover first, then gallery photos; photos of the making or the market say so when uncaptioned.
  const gallery = row.photos.map((photo) => ({ url: photo.url, caption: photo.caption ?? (photo.kind === "PRODUCT" ? null : labelOf(PHOTO_KINDS, photo.kind)) }));
  if (row.coverImage && !gallery.some((photo) => photo.url === row.coverImage)) gallery.unshift({ url: row.coverImage, caption: null });

  return {
    ...row,
    image: row.coverImage ?? row.photos[0]?.url ?? null,
    gallery,
    destinations,
    states: [...new Set(destinations.map((destination) => destination.village?.state).filter(Boolean))],
    sellers,
  };
}

/** Same destination or state first, same category as a tie-breaker. */
export async function getRelatedSouvenirs(souvenir, limit = 4) {
  const where = { AND: [{ isPublished: true }, { id: { not: souvenir.id } }, { destinations: { some: { destination: { is: { village: { is: { state: { in: souvenir.states } } } } } } } }] };
  const rows = await souvenirRepository.findSouvenirCards({ where, take: 40 });
  const ids = new Set(souvenir.destinations.map((destination) => destination.id));

  return rows
    .map((row) => toSouvenirCard(row))
    .map((card) => ({ card, score: (card.destinations.some((destination) => ids.has(destination.id)) ? 2 : 0) + (card.category.id === souvenir.categoryId ? 1 : 0) }))
    .sort((first, second) => second.score - first.score || first.card.name.localeCompare(second.card.name))
    .slice(0, limit)
    .map((entry) => entry.card);
}

/**
 * For a destination page: this destination's souvenirs first, then others from the same state.
 * Never other states. Includes the distance from the destination to the nearest seller.
 */
export async function getDestinationSouvenirs(destination, limit = 6) {
  const state = destination.village?.state;
  const rows = await souvenirRepository.findSouvenirCards({ where: souvenirRepository.buildSouvenirWhere({ state }), take: 200 });
  const cards = rows.map((row) => toSouvenirCard(row, destination));
  const ranked = rankSouvenirs(cards, { destinationId: destination.id, state }, { limit });

  return { items: ranked.map(({ item, reasons }) => ({ ...item, reasons })), total: cards.length, state };
}

/** "Help me choose": rule-based and explainable (see lib/utils/souvenir-rank.js). */
export async function recommendSouvenirs(query = {}) {
  const destination = query.destination ? await souvenirRepository.findDestinationForSouvenirs({ slug: query.destination }) : null;
  if (query.destination && !destination) throw notFoundError("We couldn't find that destination");

  const state = destination?.village?.state ?? query.state;
  const rows = await souvenirRepository.findSouvenirCards({ where: souvenirRepository.buildSouvenirWhere({ state }), take: 300 });
  const cards = rows.map((row) => toSouvenirCard(row, destination));
  const ranked = rankSouvenirs(cards, { destinationId: destination?.id, state, band: budgetBand(query.budget), audience: query.for, interest: query.interest }, { limit: query.limit ?? 6 });

  return { destination: destination ? { name: destination.name, slug: destination.slug, state } : null, state: state ?? null, results: ranked.map(({ item, reasons }) => ({ ...item, reasons })) };
}

// ---------------------------------------------------------------------------
// Admin: souvenirs
// ---------------------------------------------------------------------------

export async function listSouvenirsForAdmin(query = {}) {
  const { page, limit, skip } = getPagination(query, 20);
  const where = souvenirRepository.buildSouvenirWhere({
    q: query.search,
    destinationId: query.destinationId,
    categorySlug: query.category,
    includeUnpublished: true,
  });
  const published = typeof query.published === "boolean" ? { isPublished: query.published } : null;
  const { items, total } = await souvenirRepository.listSouvenirs({ where: published ? { AND: [where, published] } : where, skip, take: limit });
  return { data: items.map((row) => toSouvenirCard(row)), meta: buildMeta({ page, limit, total }) };
}

export async function getSouvenirForAdmin(id) {
  const row = await souvenirRepository.findSouvenirById(id);
  if (!row) throw notFoundError("Souvenir not found");
  return row;
}

async function assertSouvenirInput(input, currentId = null) {
  const owner = await souvenirRepository.findSouvenirSlugOwner(input.slug);
  if (owner && owner.id !== currentId) throw conflictError("Another souvenir already uses this URL slug", { fieldErrors: { slug: ["Already in use"] } });

  if (!(await souvenirRepository.countCategoryById(input.categoryId))) {
    throw badRequest("Choose a category from the list", { fieldErrors: { categoryId: ["Choose a category"] } });
  }
  if ((await souvenirRepository.countDestinationsByIds(input.destinationIds)) !== input.destinationIds.length) {
    throw badRequest("One or more destinations no longer exist", { fieldErrors: { destinationIds: ["Refresh and choose again"] } });
  }

  const sellerIds = input.sellers.map((seller) => seller.sellerId);
  if (sellerIds.length && (await sellerRepository.countSellersByIds(sellerIds)) !== sellerIds.length) {
    throw badRequest("One or more places to buy no longer exist", { fieldErrors: { sellers: ["Refresh and choose again"] } });
  }
}

function splitSouvenirInput(input) {
  const { destinationIds, sellers, photos, ...data } = input;
  return { data, relations: { destinationIds, sellers, photos: [...new Map(photos.map((photo) => [photo.url, photo])).values()] } };
}

export async function createSouvenir(input) {
  await assertSouvenirInput(input);
  const { data, relations } = splitSouvenirInput(input);
  return souvenirRepository.saveSouvenir(null, data, relations);
}

export async function updateSouvenir(id, input) {
  await getSouvenirForAdmin(id);
  await assertSouvenirInput(input, id);
  const { data, relations } = splitSouvenirInput(input);
  return souvenirRepository.saveSouvenir(id, data, relations);
}

export async function deleteSouvenir(id) {
  await getSouvenirForAdmin(id);
  return souvenirRepository.deleteSouvenir(id);
}

export function listSouvenirCategoryOptions() {
  return souvenirRepository.listAllSouvenirCategories();
}

// ---------------------------------------------------------------------------
// Admin: categories and sellers
// ---------------------------------------------------------------------------

export async function listSouvenirCategories(query = {}) {
  const { page, limit, skip } = getPagination(query, 50);
  const { items, total } = await souvenirRepository.listSouvenirCategories({ search: query.search, skip, take: limit });
  return { data: items, meta: buildMeta({ page, limit, total }) };
}

export const createSouvenirCategory = (input) => souvenirRepository.createSouvenirCategory(input);
export const updateSouvenirCategory = (id, input) => souvenirRepository.updateSouvenirCategory(id, input);

export async function deleteSouvenirCategory(id) {
  const count = await souvenirRepository.countSouvenirsInCategory(id);
  if (count) throw conflictError(`This category has ${count} souvenir${count === 1 ? "" : "s"}. Move them to another category first.`);
  return souvenirRepository.deleteSouvenirCategory(id);
}

export async function listSellers(query = {}) {
  const { page, limit, skip } = getPagination(query, 20);
  const { items, total } = await sellerRepository.listSellers({ search: query.search, skip, take: limit });
  return { data: items, meta: buildMeta({ page, limit, total }) };
}

export function listSellerOptions() {
  return sellerRepository.listAllSellers();
}

async function assertSellerInput(input, currentId = null) {
  const owner = await sellerRepository.findSellerSlugOwner(input.slug);
  if (owner && owner.id !== currentId) throw conflictError("Another place already uses this URL slug", { fieldErrors: { slug: ["Already in use"] } });
  if (input.villageId && !(await sellerRepository.villageExists(input.villageId))) throw badRequest("Choose a village from the list", { fieldErrors: { villageId: ["Choose a village"] } });
}

export async function createSeller(input) {
  await assertSellerInput(input);
  return sellerRepository.createSeller(input);
}

export async function updateSeller(id, input) {
  await assertSellerInput(input, id);
  return sellerRepository.updateSeller(id, input);
}

/** Deleting a seller unlinks it from its souvenirs (cascade on the join table only). */
export const deleteSeller = (id) => sellerRepository.deleteSeller(id);
