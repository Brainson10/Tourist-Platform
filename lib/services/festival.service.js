import { conflictError, notFoundError } from "@/lib/api/errors";
import * as destinationRepository from "@/lib/repositories/destination.repository";
import * as festivalRepository from "@/lib/repositories/festival.repository";
import { buildMeta, getPagination } from "@/lib/services/pagination";

export function toFestivalCard(festival) {
  return { ...festival, image: festival.imageUrl ?? festival.destination?.coverImage ?? null };
}

export async function listFestivals(query = {}) {
  const when = query.when ?? "upcoming";
  const { page, limit, skip } = getPagination(query, 12);
  const { items, total } = await festivalRepository.listFestivals({
    where: festivalRepository.buildFestivalWhere({ ...query, when }),
    skip,
    take: limit,
    when,
  });

  return { data: items.map(toFestivalCard), meta: buildMeta({ page, limit, total }) };
}

export async function getFestivalBySlug(slug) {
  const festival = await festivalRepository.findFestivalBySlug(slug);

  if (!festival) {
    throw notFoundError("We couldn't find that festival");
  }

  return toFestivalCard(festival);
}

async function assertValid(input, currentId = null) {
  if (!(await destinationRepository.findDestinationSummary(input.destinationId))) {
    throw notFoundError("Choose a destination from the list");
  }

  const owner = await festivalRepository.findSlugOwner(input.slug);

  if (owner && owner.id !== currentId) {
    throw conflictError("Another festival already uses this URL slug", { fieldErrors: { slug: ["Already in use"] } });
  }
}

export async function createFestival(input) {
  await assertValid(input);
  return festivalRepository.createFestival(input);
}

export async function updateFestival(id, input) {
  if (!(await festivalRepository.findFestivalById(id))) throw notFoundError("Festival not found");
  await assertValid(input, id);
  return festivalRepository.updateFestival(id, input);
}

export async function deleteFestival(id) {
  if (!(await festivalRepository.findFestivalById(id))) throw notFoundError("Festival not found");
  return festivalRepository.deleteFestival(id);
}
