import prisma from "@/lib/db";
import { notFoundError } from "@/lib/api/errors";

function pagination({ limit = 50, offset = 0 } = {}) {
  return {
    take: limit,
    skip: offset,
  };
}

async function ensureDestinationExists(destinationId) {
  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
    select: { id: true },
  });

  if (!destination) {
    throw notFoundError("Destination not found");
  }
}

export async function listStories(filters = {}) {
  const { destinationId, language, search, ...page } = filters;

  return prisma.story.findMany({
    where: {
      ...(destinationId ? { destinationId } : {}),
      ...(language ? { language } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      destination: true,
    },
    orderBy: { createdAt: "desc" },
    ...pagination(page),
  });
}

export async function getStoryById(id) {
  const story = await prisma.story.findUnique({
    where: { id },
    include: {
      destination: true,
    },
  });

  if (!story) {
    throw notFoundError("Story not found");
  }

  return story;
}

export async function createStory(data) {
  await ensureDestinationExists(data.destinationId);

  return prisma.story.create({
    data,
  });
}

export async function updateStory(id, data) {
  await getStoryById(id);

  if (data.destinationId) {
    await ensureDestinationExists(data.destinationId);
  }

  return prisma.story.update({
    where: { id },
    data,
  });
}

export async function deleteStory(id) {
  await getStoryById(id);

  return prisma.story.delete({
    where: { id },
  });
}

export function getFeaturedStories() {
  return [
    {
      title: "Stories from the riverbanks",
      blurb: "Local voices narrate the living heritage of Northeast India through immersive stories.",
    },
    {
      title: "The craft of place",
      blurb: "Explore how weaves, traditions, and seasonal rituals shape regional identity.",
    },
  ];
}
