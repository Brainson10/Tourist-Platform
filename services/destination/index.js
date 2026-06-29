import prisma from "@/lib/db";
import { notFoundError } from "@/lib/api/errors";

const destinationInclude = {
  experiences: true,
  festivals: true,
  stories: true,
};

function pagination({ limit = 50, offset = 0 } = {}) {
  return {
    take: limit,
    skip: offset,
  };
}

export async function listDestinations(filters = {}) {
  const { state, district, search, ...page } = filters;

  return prisma.destination.findMany({
    where: {
      ...(state ? { state } : {}),
      ...(district ? { district } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { state: { contains: search, mode: "insensitive" } },
              { district: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    ...pagination(page),
  });
}

export async function getDestinationById(id) {
  const destination = await prisma.destination.findUnique({
    where: { id },
    include: destinationInclude,
  });

  if (!destination) {
    throw notFoundError("Destination not found");
  }

  return destination;
}

export async function createDestination(data) {
  return prisma.destination.create({
    data,
  });
}

export async function updateDestination(id, data) {
  await getDestinationById(id);

  return prisma.destination.update({
    where: { id },
    data,
  });
}

export async function deleteDestination(id) {
  await getDestinationById(id);

  return prisma.destination.delete({
    where: { id },
  });
}
