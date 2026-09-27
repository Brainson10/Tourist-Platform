import prisma from "@/lib/db";

const areasInclude = { areas: { include: { destination: { select: { id: true, name: true, slug: true, village: { select: { state: true } } } } } } };
const publicGuideInclude = { user: { select: { fullName: true } }, ...areasInclude };

export function findProfileByUserId(userId) {
  return prisma.guideProfile.findUnique({ where: { userId }, include: areasInclude });
}

/** Creates or updates a profile and replaces the destinations it covers. */
export function saveProfile(userId, data, areaIds) {
  return prisma.$transaction(async (tx) => {
    const profile = await tx.guideProfile.upsert({ where: { userId }, create: { ...data, userId }, update: data });
    await tx.guideArea.deleteMany({ where: { guideId: profile.id } });
    await tx.guideArea.createMany({ data: areaIds.map((destinationId) => ({ guideId: profile.id, destinationId })) });
    return profile;
  });
}

export async function listApprovedGuides({ destinationSlug, destinationId, language, skip = 0, take = 12 } = {}) {
  const and = [{ status: "APPROVED" }, { user: { is: { isBlocked: false } } }];
  if (destinationId) and.push({ areas: { some: { destinationId } } });
  if (destinationSlug) and.push({ areas: { some: { destination: { is: { slug: destinationSlug } } } } });
  if (language) and.push({ languages: { has: language } });
  const where = { AND: and };

  const [items, total] = await Promise.all([
    prisma.guideProfile.findMany({ where, include: publicGuideInclude, orderBy: [{ yearsExperience: "desc" }, { createdAt: "asc" }], skip, take }),
    prisma.guideProfile.count({ where }),
  ]);

  return { items, total };
}

export function findApprovedGuide(id) {
  return prisma.guideProfile.findFirst({ where: { id, status: "APPROVED", user: { is: { isBlocked: false } } }, include: publicGuideInclude });
}

export async function listLanguages() {
  const rows = await prisma.guideProfile.findMany({ where: { status: "APPROVED" }, select: { languages: true } });
  return [...new Set(rows.flatMap((row) => row.languages))].sort();
}

export async function listGuidesForAdmin({ status, search, skip = 0, take = 20 } = {}) {
  const contains = (value) => ({ contains: value, mode: "insensitive" });
  const and = [];
  if (["PENDING", "APPROVED", "REJECTED"].includes(status)) and.push({ status });
  if (search) and.push({ OR: [{ headline: contains(search) }, { user: { is: { fullName: contains(search) } } }, { user: { is: { email: contains(search) } } }] });
  const where = and.length ? { AND: and } : {};

  const [items, total] = await Promise.all([
    prisma.guideProfile.findMany({
      where,
      include: { user: { select: { id: true, fullName: true, email: true, role: true } }, ...areasInclude, _count: { select: { requests: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip,
      take,
    }),
    prisma.guideProfile.count({ where }),
  ]);

  return { items, total };
}

export function findProfileById(id) {
  return prisma.guideProfile.findUnique({ where: { id }, include: { user: { select: { id: true, role: true } } } });
}

export function setProfileStatus(id, status) {
  return prisma.guideProfile.update({ where: { id }, data: { status } });
}

export function deleteProfile(id) {
  return prisma.guideProfile.delete({ where: { id }, select: { id: true, userId: true } });
}

export function countOpenRequests(guideId, touristId) {
  return prisma.guideRequest.count({ where: { guideId, touristId, status: "NEW" } });
}

export function createRequest(data) {
  return prisma.guideRequest.create({ data });
}

export function findRequest(id) {
  return prisma.guideRequest.findUnique({ where: { id }, include: { guide: { select: { id: true, userId: true } } } });
}

export function updateRequestStatus(id, status) {
  return prisma.guideRequest.update({ where: { id }, data: { status } });
}

export function listRequestsForGuide(guideId) {
  return prisma.guideRequest.findMany({
    where: { guideId },
    include: { tourist: { select: { fullName: true, email: true, phone: true } }, destination: { select: { name: true, slug: true } } },
    orderBy: [{ status: "asc" }, { startDate: "asc" }],
  });
}

export function listRequestsForTourist(touristId) {
  return prisma.guideRequest.findMany({
    where: { touristId },
    include: {
      guide: { select: { id: true, headline: true, phone: true, photoUrl: true, user: { select: { fullName: true, email: true } } } },
      destination: { select: { name: true, slug: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });
}
