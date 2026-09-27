import { notFoundError } from "@/lib/api/errors";
import * as destinationRepository from "@/lib/repositories/destination.repository";
import * as savedRepository from "@/lib/repositories/saved.repository";
import { toDestinationCard } from "@/lib/services/destination.service";

export async function setSaved(userId, destinationId, saved) {
  if (!(await destinationRepository.findDestinationSummary(destinationId))) {
    throw notFoundError("We couldn't find that destination");
  }

  if (saved) {
    await savedRepository.saveDestination(userId, destinationId);
  } else {
    await savedRepository.unsaveDestination(userId, destinationId);
  }

  return { destinationId, saved };
}

export function isSaved(userId, destinationId) {
  return userId ? savedRepository.isSaved(userId, destinationId) : false;
}

export async function listSaved(userId, take) {
  const destinations = await savedRepository.listSavedDestinations(userId, take);
  return destinations.map(toDestinationCard);
}

export function listSavedIds(userId) {
  return userId ? savedRepository.listSavedDestinationIds(userId) : [];
}
