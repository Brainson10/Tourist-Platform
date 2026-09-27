import { conflictError, notFoundError } from "@/lib/api/errors";
import * as destinationRepository from "@/lib/repositories/destination.repository";
import * as storyRepository from "@/lib/repositories/story.repository";
import { buildMeta, getPagination } from "@/lib/services/pagination";
import { excerpt } from "@/lib/utils/format";

export function toStoryCard(story) {
  return {
    ...story,
    summary: story.excerpt || excerpt(story.content, 180),
    image: story.coverImage ?? story.destination?.coverImage ?? null,
  };
}

export async function listStories(query = {}) {
  const { page, limit, skip } = getPagination(query, 12);
  const { items, total } = await storyRepository.listStories({
    where: storyRepository.buildStoryWhere(query),
    skip,
    take: limit,
  });

  return { data: items.map(toStoryCard), meta: buildMeta({ page, limit, total }) };
}

export async function getStoryBySlug(slug) {
  const story = await storyRepository.findStoryBySlug(slug);

  if (!story) {
    throw notFoundError("We couldn't find that story");
  }

  return toStoryCard(story);
}

export async function getMoreStories(story) {
  const stories = await storyRepository.findMoreStories({ id: story.id, destinationId: story.destinationId });
  return stories.map(toStoryCard);
}

async function assertValid(input, currentId = null) {
  if (!(await destinationRepository.findDestinationSummary(input.destinationId))) {
    throw notFoundError("Choose a destination from the list");
  }

  const owner = await storyRepository.findSlugOwner(input.slug);

  if (owner && owner.id !== currentId) {
    throw conflictError("Another story already uses this URL slug", { fieldErrors: { slug: ["Already in use"] } });
  }
}

export async function createStory(input) {
  await assertValid(input);
  return storyRepository.createStory(input);
}

export async function updateStory(id, input) {
  if (!(await storyRepository.findStoryById(id))) throw notFoundError("Story not found");
  await assertValid(input, id);
  return storyRepository.updateStory(id, input);
}

export async function deleteStory(id) {
  if (!(await storyRepository.findStoryById(id))) throw notFoundError("Story not found");
  return storyRepository.deleteStory(id);
}
