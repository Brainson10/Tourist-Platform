import prisma from "@/lib/db";
import { destinationCardInclude } from "@/lib/repositories/destination.repository";

export function saveDestination(userId, destinationId) {
  return prisma.savedDestination.upsert({
    where: { userId_destinationId: { userId, destinationId } },
    create: { userId, destinationId },
    update: {},
  });
}

export function unsaveDestination(userId, destinationId) {
  return prisma.savedDestination.deleteMany({ where: { userId, destinationId } });
}

export async function isSaved(userId, destinationId) {
  const row = await prisma.savedDestination.findUnique({
    where: { userId_destinationId: { userId, destinationId } },
    select: { userId: true },
  });

  return Boolean(row);
}

export async function listSavedDestinations(userId, take = 50) {
  const rows = await prisma.savedDestination.findMany({
    where: { userId },
    include: { destination: { include: destinationCardInclude } },
    orderBy: { createdAt: "desc" },
    take,
  });

  return rows.map((row) => row.destination);
}

export async function listSavedDestinationIds(userId) {
  const rows = await prisma.savedDestination.findMany({ where: { userId }, select: { destinationId: true } });
  return rows.map((row) => row.destinationId);
}
