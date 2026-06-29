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

export async function listFestivals(filters = {}) {
  const { destinationId, from, to, search, ...page } = filters;

  return prisma.festival.findMany({
    where: {
      ...(destinationId ? { destinationId } : {}),
      ...(from || to
        ? {
            startDate: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      destination: true,
    },
    orderBy: { startDate: "asc" },
    ...pagination(page),
  });
}

export async function getFestivalById(id) {
  const festival = await prisma.festival.findUnique({
    where: { id },
    include: {
      destination: true,
    },
  });

  if (!festival) {
    throw notFoundError("Festival not found");
  }

  return festival;
}

export async function createFestival(data) {
  await ensureDestinationExists(data.destinationId);

  return prisma.festival.create({
    data,
  });
}

export async function updateFestival(id, data) {
  await getFestivalById(id);

  if (data.destinationId) {
    await ensureDestinationExists(data.destinationId);
  }

  return prisma.festival.update({
    where: { id },
    data,
  });
}

export async function deleteFestival(id) {
  await getFestivalById(id);

  return prisma.festival.delete({
    where: { id },
  });
}
