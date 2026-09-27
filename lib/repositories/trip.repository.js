import prisma from "@/lib/db";

const destinationSummary = {
  select: {
    id: true,
    name: true,
    slug: true,
    coverImage: true,
    latitude: true,
    longitude: true,
    village: { select: { name: true, district: true, state: true } },
    photos: { orderBy: { displayOrder: "asc" }, take: 1, select: { imageUrl: true } },
  },
};

export function listTripsForUser(userId, { take = 50 } = {}) {
  return prisma.trip.findMany({
    where: { userId },
    include: { destination: destinationSummary, _count: { select: { items: true } } },
    orderBy: [{ startDate: "asc" }],
    take,
  });
}

export function findTripForUser(id, userId) {
  return prisma.trip.findFirst({
    where: { id, userId },
    include: {
      destination: destinationSummary,
      checklist: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
      items: {
        orderBy: [{ day: "asc" }, { position: "asc" }, { createdAt: "asc" }],
        include: {
          destination: { select: { id: true, name: true, slug: true, latitude: true, longitude: true } },
          experience: { select: { id: true, title: true, duration: true, price: true } },
        },
      },
    },
  });
}

/** Read-only view for a shared link. Deliberately excludes notes, budget, checklist and owner contact details. */
export function findSharedTrip(shareToken) {
  return prisma.trip.findUnique({
    where: { shareToken },
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      status: true,
      travelers: true,
      destinationId: true,
      destination: destinationSummary,
      user: { select: { fullName: true } },
      items: {
        orderBy: [{ day: "asc" }, { position: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          day: true,
          position: true,
          title: true,
          time: true,
          destination: { select: { id: true, name: true, slug: true, latitude: true, longitude: true } },
          experience: { select: { id: true, title: true, duration: true } },
        },
      },
    },
  });
}

export function setShareToken(id, shareToken) {
  return prisma.trip.update({ where: { id }, data: { shareToken }, select: { id: true, shareToken: true } });
}

export function listTripItemIds(tripId) {
  return prisma.tripItem.findMany({ where: { tripId }, select: { id: true } });
}

/** Applies a complete new order (day + position for every item) atomically. */
export function applyItemOrder(tripId, days) {
  return prisma.$transaction(async (tx) => {
    for (const { day, itemIds } of days) {
      for (const [position, itemId] of itemIds.entries()) await tx.tripItem.updateMany({ where: { id: itemId, tripId }, data: { day, position } });
    }
  });
}

export function listChecklist(tripId) {
  return prisma.tripChecklistItem.findMany({ where: { tripId }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
}

export async function addChecklistItems(tripId, labels) {
  const last = await prisma.tripChecklistItem.findFirst({ where: { tripId }, orderBy: { position: "desc" }, select: { position: true } });
  const start = (last?.position ?? -1) + 1;
  return prisma.tripChecklistItem.createMany({ data: labels.map((label, index) => ({ tripId, label, position: start + index })) });
}

export function findChecklistItem(tripId, itemId) {
  return prisma.tripChecklistItem.findFirst({ where: { id: itemId, tripId } });
}

export function updateChecklistItem(itemId, data) {
  return prisma.tripChecklistItem.update({ where: { id: itemId }, data });
}

export function deleteChecklistItem(itemId) {
  return prisma.tripChecklistItem.delete({ where: { id: itemId }, select: { id: true } });
}

export function findTripOwnership(id, userId) {
  return prisma.trip.findFirst({ where: { id, userId }, select: { id: true, startDate: true, endDate: true, destinationId: true, shareToken: true } });
}

export function createTrip(userId, data, items = []) {
  return prisma.trip.create({
    data: { ...data, userId, items: { create: items } },
    select: { id: true },
  });
}

export function updateTrip(id, data) {
  return prisma.trip.update({ where: { id }, data, select: { id: true } });
}

export function deleteTrip(id) {
  return prisma.trip.delete({ where: { id }, select: { id: true } });
}

export async function nextItemPosition(tripId, day) {
  const last = await prisma.tripItem.findFirst({ where: { tripId, day }, orderBy: { position: "desc" }, select: { position: true } });
  return (last?.position ?? -1) + 1;
}

export function createTripItem(tripId, data) {
  return prisma.tripItem.create({ data: { ...data, tripId } });
}

export function findTripItem(tripId, itemId) {
  return prisma.tripItem.findFirst({ where: { id: itemId, tripId } });
}

export function updateTripItem(itemId, data) {
  return prisma.tripItem.update({ where: { id: itemId }, data });
}

export function deleteTripItem(itemId) {
  return prisma.tripItem.delete({ where: { id: itemId }, select: { id: true } });
}

export function listDayItems(tripId, day) {
  return prisma.tripItem.findMany({ where: { tripId, day }, orderBy: [{ position: "asc" }, { createdAt: "asc" }], select: { id: true, position: true } });
}

// Writes run sequentially inside interactive transactions: atomic, without concurrent queries on one connection.
export function swapItemPositions(first, second) {
  return prisma.$transaction(async (tx) => {
    await tx.tripItem.update({ where: { id: first.id }, data: { position: second.position } });
    await tx.tripItem.update({ where: { id: second.id }, data: { position: first.position } });
  });
}

export function reindexDayItems(items) {
  return prisma.$transaction(async (tx) => {
    for (const [index, item] of items.entries()) await tx.tripItem.update({ where: { id: item.id }, data: { position: index } });
  });
}

/** Remove itinerary items that fall outside the trip's new length. */
export function deleteItemsAfterDay(tripId, lastDay) {
  return prisma.tripItem.deleteMany({ where: { tripId, day: { gt: lastDay } } });
}
