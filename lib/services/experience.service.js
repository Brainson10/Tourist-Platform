import { notFoundError } from "@/lib/api/errors";
import * as destinationRepository from "@/lib/repositories/destination.repository";
import * as experienceRepository from "@/lib/repositories/experience.repository";
import { buildMeta, getPagination } from "@/lib/services/pagination";

export function toExperienceCard(experience) {
  const destination = experience.destination;

  return {
    ...experience,
    image: experience.imageUrl ?? destination?.coverImage ?? destination?.photos?.[0]?.imageUrl ?? null,
  };
}

export async function listExperiences(query = {}) {
  const { page, limit, skip } = getPagination(query, 12);
  const { items, total } = await experienceRepository.listExperiences({
    where: experienceRepository.buildExperienceWhere(query),
    skip,
    take: limit,
  });

  return { data: items.map(toExperienceCard), meta: buildMeta({ page, limit, total }) };
}

export async function getExperience(id) {
  const experience = await experienceRepository.findExperienceById(id);

  if (!experience) {
    throw notFoundError("We couldn't find that experience");
  }

  return toExperienceCard(experience);
}

export async function getRelatedExperiences(experience) {
  const related = await experienceRepository.findRelatedExperiences({
    id: experience.id,
    destinationId: experience.destinationId,
    category: experience.category,
  });

  return related.map(toExperienceCard);
}

export function listExperienceOptions(destinationId) {
  return experienceRepository.listExperiencesForDestination(destinationId);
}

async function assertDestination(destinationId) {
  if (!(await destinationRepository.findDestinationSummary(destinationId))) {
    throw notFoundError("Choose a destination from the list");
  }
}

export async function createExperience(input) {
  await assertDestination(input.destinationId);
  return experienceRepository.createExperience(input);
}

export async function updateExperience(id, input) {
  await getExperience(id);
  await assertDestination(input.destinationId);
  return experienceRepository.updateExperience(id, input);
}

export async function deleteExperience(id) {
  await getExperience(id);
  return experienceRepository.deleteExperience(id);
}
