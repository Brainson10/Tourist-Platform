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

export async function listExperiences(filters = {}) {
  const { destinationId, category, search, ...page } = filters;

  return prisma.experience.findMany({
    where: {
      ...(destinationId ? { destinationId } : {}),
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { difficulty: { contains: search, mode: "insensitive" } },
              { duration: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      destination: true,
    },
    orderBy: { title: "asc" },
    ...pagination(page),
  });
}

export async function getExperienceById(id) {
  const experience = await prisma.experience.findUnique({
    where: { id },
    include: {
      destination: true,
    },
  });

  if (!experience) {
    throw notFoundError("Experience not found");
  }

  return experience;
}

export async function createExperience(data) {
  await ensureDestinationExists(data.destinationId);

  return prisma.experience.create({
    data,
  });
}

export async function updateExperience(id, data) {
  await getExperienceById(id);

  if (data.destinationId) {
    await ensureDestinationExists(data.destinationId);
  }

  return prisma.experience.update({
    where: { id },
    data,
  });
}

export async function deleteExperience(id) {
  await getExperienceById(id);

  return prisma.experience.delete({
    where: { id },
  });
}
