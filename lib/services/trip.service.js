import { randomBytes } from "node:crypto";
import { badRequest, notFoundError } from "@/lib/api/errors";
import * as destinationRepository from "@/lib/repositories/destination.repository";
import * as tripRepository from "@/lib/repositories/trip.repository";
import { getPermitForState } from "@/lib/services/permit.service";
import { getSettings } from "@/lib/services/settings.service";
import { estimateBudget } from "@/lib/utils/budget";
import { tripLength } from "@/lib/utils/format";
import { suggestPackingList } from "@/lib/utils/packing";

export function tripPhase(trip, now = new Date()) {
  if (trip.status === "CANCELLED") return "cancelled";
  if (trip.status === "COMPLETED") return "past";

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (new Date(trip.endDate) < today) return "past";
  if (new Date(trip.startDate) <= now) return "ongoing";
  return "upcoming";
}

function toTripSummary(trip) {
  return {
    ...trip,
    days: tripLength(trip.startDate, trip.endDate),
    phase: tripPhase(trip),
    image: trip.destination?.coverImage ?? trip.destination?.photos?.[0]?.imageUrl ?? null,
    itemCount: trip._count?.items ?? trip.items?.length ?? 0,
  };
}

export async function listTrips(userId) {
  const trips = await tripRepository.listTripsForUser(userId);
  return trips.map(toTripSummary);
}

export async function getTrip(id, userId) {
  const trip = await tripRepository.findTripForUser(id, userId);

  if (!trip) {
    throw notFoundError("We couldn't find that trip");
  }

  const summary = toTripSummary(trip);
  const days = Array.from({ length: summary.days }, (_, index) => ({
    day: index + 1,
    items: trip.items.filter((item) => item.day === index + 1),
  }));
  const { defaultDailyBudget } = await getSettings();
  const budget = estimateBudget({
    days: summary.days,
    travelers: trip.travelers,
    dailyBudget: trip.dailyBudget ?? defaultDailyBudget,
    experiences: trip.items.filter((item) => item.experience).map((item) => item.experience),
  });

  return {
    ...summary,
    itinerary: days,
    stops: buildRouteStops(trip),
    budget: { ...budget, usesDefaultDaily: trip.dailyBudget === null },
    shareUrlPath: trip.shareToken ? `/t/${trip.shareToken}` : null,
  };
}

/** Public, read-only view of a shared trip. Returns null for unknown or revoked links. */
export async function getSharedTrip(shareToken) {
  const trip = await tripRepository.findSharedTrip(shareToken);
  if (!trip) return null;

  const days = tripLength(trip.startDate, trip.endDate);

  return {
    title: trip.title,
    startDate: trip.startDate,
    endDate: trip.endDate,
    days,
    travelers: trip.travelers,
    destination: trip.destination,
    image: trip.destination?.coverImage ?? trip.destination?.photos?.[0]?.imageUrl ?? null,
    plannedBy: trip.user?.fullName?.split(" ")[0] ?? "A traveler",
    itinerary: Array.from({ length: days }, (_, index) => ({ day: index + 1, items: trip.items.filter((item) => item.day === index + 1) })),
    stops: buildRouteStops(trip),
  };
}

/** Places on the itinerary for the route map: the trip's destination first, then others in order of appearance. */
export function buildRouteStops(trip) {
  const stops = new Map();
  const add = (destination, day) => {
    if (!destination || !Number.isFinite(destination.latitude) || !Number.isFinite(destination.longitude)) return;
    const stop = stops.get(destination.id) ?? { id: destination.id, name: destination.name, slug: destination.slug, latitude: destination.latitude, longitude: destination.longitude, days: [] };
    if (day && !stop.days.includes(day)) stop.days.push(day);
    stops.set(destination.id, stop);
  };

  add(trip.destination);
  for (const item of trip.items ?? []) add(item.destination, item.day);

  return [...stops.values()];
}

async function resolveDestination(destinationId) {
  if (!destinationId) return null;
  const destination = await destinationRepository.findDestinationById(destinationId);

  if (!destination) {
    throw notFoundError("Choose a destination from the list");
  }

  return destination;
}

/**
 * A simple starter plan from the destination's own content: arrival on day 1,
 * then its experiences and things to do spread across the remaining days.
 */
export function buildStarterItinerary(destination, days) {
  const ideas = [
    ...destination.experiences.map((experience) => ({ title: experience.title, experienceId: experience.id, notes: experience.duration ? `About ${experience.duration}` : null })),
    ...destination.thingsToDo.map((title) => ({ title })),
  ];
  const items = [{ day: 1, position: 0, title: `Arrive at ${destination.name}`, notes: destination.transportation ? "Check the getting-there notes on the destination page." : null, destinationId: destination.id }];
  const perDay = Math.max(1, Math.ceil(ideas.length / Math.max(days, 1)));

  ideas.slice(0, days * 3).forEach((idea, index) => {
    const day = Math.min(days, 1 + Math.floor(index / perDay));
    items.push({
      day,
      position: items.filter((item) => item.day === day).length,
      title: idea.title,
      notes: idea.notes ?? null,
      destinationId: destination.id,
      experienceId: idea.experienceId ?? null,
    });
  });

  return items;
}

export async function createTrip(userId, input) {
  const { suggestItinerary, ...data } = input;
  const destination = await resolveDestination(data.destinationId);
  const items = destination && suggestItinerary ? buildStarterItinerary(destination, tripLength(data.startDate, data.endDate)) : [];

  return tripRepository.createTrip(userId, data, items);
}

async function requireOwnedTrip(id, userId) {
  const trip = await tripRepository.findTripOwnership(id, userId);

  if (!trip) {
    throw notFoundError("We couldn't find that trip");
  }

  return trip;
}

export async function updateTrip(id, userId, input) {
  await requireOwnedTrip(id, userId);
  await resolveDestination(input.destinationId);
  const updated = await tripRepository.updateTrip(id, input);
  await tripRepository.deleteItemsAfterDay(id, tripLength(input.startDate, input.endDate));
  return updated;
}

export async function deleteTrip(id, userId) {
  await requireOwnedTrip(id, userId);
  return tripRepository.deleteTrip(id);
}

export async function addTripItem(tripId, userId, input) {
  const trip = await requireOwnedTrip(tripId, userId);

  if (input.day > tripLength(trip.startDate, trip.endDate)) {
    throw badRequest("That day is outside your trip dates", { fieldErrors: { day: ["Choose a day within the trip"] } });
  }

  const position = await tripRepository.nextItemPosition(tripId, input.day);
  return tripRepository.createTripItem(tripId, { ...input, position });
}

async function requireItem(tripId, itemId) {
  const item = await tripRepository.findTripItem(tripId, itemId);

  if (!item) {
    throw notFoundError("That itinerary item no longer exists");
  }

  return item;
}

export async function updateTripItem(tripId, itemId, userId, input) {
  const trip = await requireOwnedTrip(tripId, userId);
  const item = await requireItem(tripId, itemId);

  if (input.day > tripLength(trip.startDate, trip.endDate)) {
    throw badRequest("That day is outside your trip dates", { fieldErrors: { day: ["Choose a day within the trip"] } });
  }

  const position = input.day === item.day ? item.position : await tripRepository.nextItemPosition(tripId, input.day);
  return tripRepository.updateTripItem(itemId, { ...input, position });
}

export async function moveTripItem(tripId, itemId, userId, direction) {
  await requireOwnedTrip(tripId, userId);
  const item = await requireItem(tripId, itemId);
  const dayItems = await tripRepository.listDayItems(tripId, item.day);
  // Normalise positions first so swaps are always well defined.
  await tripRepository.reindexDayItems(dayItems);
  const index = dayItems.findIndex((entry) => entry.id === itemId);
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= dayItems.length) {
    return { id: itemId };
  }

  await tripRepository.swapItemPositions({ id: dayItems[index].id, position: index }, { id: dayItems[targetIndex].id, position: targetIndex });
  return { id: itemId };
}

/**
 * Saves a drag-and-drop result. The payload must list every item of the trip exactly once,
 * on days that exist, so a stale or tampered request can't lose or steal items.
 */
export async function reorderTripItems(tripId, userId, days) {
  const trip = await requireOwnedTrip(tripId, userId);
  const length = tripLength(trip.startDate, trip.endDate);
  const existing = new Set((await tripRepository.listTripItemIds(tripId)).map((item) => item.id));
  const submitted = days.flatMap((entry) => entry.itemIds);

  if (days.some((entry) => entry.day > length)) {
    throw badRequest("That day is outside your trip dates");
  }

  if (new Set(submitted).size !== submitted.length || submitted.length !== existing.size || submitted.some((id) => !existing.has(id))) {
    throw badRequest("Your itinerary changed in another tab. Refresh the page and try again.");
  }

  await tripRepository.applyItemOrder(tripId, days);
  return { tripId };
}

// ---------------------------------------------------------------------------
// Packing checklist
// ---------------------------------------------------------------------------

export async function addChecklistItem(tripId, userId, label) {
  await requireOwnedTrip(tripId, userId);
  await tripRepository.addChecklistItems(tripId, [label]);
  return tripRepository.listChecklist(tripId);
}

export async function updateChecklistItem(tripId, itemId, userId, input) {
  await requireOwnedTrip(tripId, userId);
  if (!(await tripRepository.findChecklistItem(tripId, itemId))) throw notFoundError("That checklist item no longer exists");
  return tripRepository.updateChecklistItem(itemId, input);
}

export async function deleteChecklistItem(tripId, itemId, userId) {
  await requireOwnedTrip(tripId, userId);
  if (!(await tripRepository.findChecklistItem(tripId, itemId))) throw notFoundError("That checklist item no longer exists");
  return tripRepository.deleteChecklistItem(itemId);
}

/** Adds rule-based suggestions (season, interests, permits) that aren't on the list yet. */
export async function addSuggestedChecklist(tripId, userId) {
  const trip = await requireOwnedTrip(tripId, userId);
  const destination = trip.destinationId ? await destinationRepository.findDestinationById(trip.destinationId) : null;
  const permit = destination ? await getPermitForState(destination.village.state) : null;
  const suggestions = suggestPackingList({
    categories: destination?.destinationCategories.map((item) => item.category.slug) ?? [],
    startDate: trip.startDate,
    endDate: trip.endDate,
    permit,
  });
  const existing = new Set((await tripRepository.listChecklist(tripId)).map((item) => item.label.toLowerCase()));
  const fresh = suggestions.filter((label) => !existing.has(label.toLowerCase()));

  if (fresh.length) await tripRepository.addChecklistItems(tripId, fresh);
  return { added: fresh.length };
}

// ---------------------------------------------------------------------------
// Share link
// ---------------------------------------------------------------------------

/** Turns sharing on (reusing the current link) or issues a brand-new link when `regenerate` is set. */
export async function enableSharing(tripId, userId, { regenerate = false } = {}) {
  const trip = await requireOwnedTrip(tripId, userId);
  if (trip.shareToken && !regenerate) return { sharePath: `/t/${trip.shareToken}` };

  const token = randomBytes(24).toString("base64url");
  await tripRepository.setShareToken(tripId, token);
  return { sharePath: `/t/${token}` };
}

export async function disableSharing(tripId, userId) {
  await requireOwnedTrip(tripId, userId);
  await tripRepository.setShareToken(tripId, null);
  return { sharePath: null };
}

export async function deleteTripItem(tripId, itemId, userId) {
  await requireOwnedTrip(tripId, userId);
  await requireItem(tripId, itemId);
  return tripRepository.deleteTripItem(itemId);
}
