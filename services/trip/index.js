import prisma from "@/lib/db";
import { notFoundError } from "@/lib/api/errors";

function pagination({ limit = 50, offset = 0 } = {}) {
  return {
    take: limit,
    skip: offset,
  };
}

export async function listTripsForUser(userId, filters = {}) {
  const { status, ...page } = filters;

  return prisma.trip.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
    },
    orderBy: { startDate: "asc" },
    ...pagination(page),
  });
}

export async function getTripForUser(id, userId) {
  const trip = await prisma.trip.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!trip) {
    throw notFoundError("Trip not found");
  }

  return trip;
}

export async function createTripForUser(userId, data) {
  return prisma.trip.create({
    data: {
      ...data,
      userId,
    },
  });
}

export async function updateTripForUser(id, userId, data) {
  await getTripForUser(id, userId);

  return prisma.trip.update({
    where: { id },
    data,
  });
}

export async function deleteTripForUser(id, userId) {
  await getTripForUser(id, userId);

  return prisma.trip.delete({
    where: { id },
  });
}
