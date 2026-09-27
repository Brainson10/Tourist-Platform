import { ApiError, badRequest, forbiddenError, notFoundError } from "@/lib/api/errors";
import * as destinationRepository from "@/lib/repositories/destination.repository";
import * as guideRepository from "@/lib/repositories/guide.repository";
import * as userRepository from "@/lib/repositories/user.repository";
import { buildMeta, getPagination } from "@/lib/services/pagination";

const MAX_OPEN_REQUESTS = 3;

/** Public shape: never includes phone or email. */
function toPublicGuide(profile) {
  return {
    id: profile.id,
    name: profile.user?.fullName ?? "Local guide",
    headline: profile.headline,
    bio: profile.bio,
    languages: profile.languages,
    yearsExperience: profile.yearsExperience,
    photoUrl: profile.photoUrl,
    areas: profile.areas.map((area) => area.destination),
  };
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export function getMyGuideProfile(user) {
  return guideRepository.findProfileByUserId(user.id);
}

/** New applications and re-applications after a rejection wait for review; approved guides stay approved. */
export async function saveGuideProfile(user, input) {
  const { areaIds, ...data } = input;
  const uniqueAreas = [...new Set(areaIds)];

  for (const destinationId of uniqueAreas) {
    if (!(await destinationRepository.findDestinationSummary(destinationId))) {
      throw badRequest("One of the destinations no longer exists. Refresh and choose again.", { fieldErrors: { areaIds: ["Choose again"] } });
    }
  }

  const existing = await guideRepository.findProfileByUserId(user.id);
  const status = existing?.status === "APPROVED" ? "APPROVED" : "PENDING";
  return guideRepository.saveProfile(user.id, { ...data, status }, uniqueAreas);
}

export async function listGuides(query = {}) {
  const { page, limit, skip } = getPagination(query, 12);
  const { items, total } = await guideRepository.listApprovedGuides({ destinationSlug: query.destination, language: query.language, skip, take: limit });
  return { data: items.map(toPublicGuide), meta: buildMeta({ page, limit, total }) };
}

export async function listGuidesForDestination(destinationId, take = 4) {
  const { items } = await guideRepository.listApprovedGuides({ destinationId, take });
  return items.map(toPublicGuide);
}

export async function getGuide(id) {
  const profile = await guideRepository.findApprovedGuide(id);
  if (!profile) throw notFoundError("We couldn't find that guide");
  return { ...toPublicGuide(profile), userId: profile.userId };
}

export function listGuideLanguages() {
  return guideRepository.listLanguages();
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export async function createGuideRequest(user, guideId, input) {
  const guide = await guideRepository.findApprovedGuide(guideId);
  if (!guide) throw notFoundError("We couldn't find that guide");
  if (guide.userId === user.id) throw badRequest("You can't send a request to yourself");

  if ((await guideRepository.countOpenRequests(guideId, user.id)) >= MAX_OPEN_REQUESTS) {
    throw new ApiError(`You already have ${MAX_OPEN_REQUESTS} open requests with this guide. Wait for a reply first.`, 429, "RATE_LIMITED");
  }

  if (input.destinationId && !guide.areas.some((area) => area.destinationId === input.destinationId)) {
    throw badRequest("This guide doesn't cover that destination", { fieldErrors: { destinationId: ["Choose one of the guide's destinations"] } });
  }

  return guideRepository.createRequest({ ...input, guideId, touristId: user.id });
}

/**
 * Guides accept or decline NEW requests; travelers cancel their own. Anyone else gets a 404,
 * so request ids can't be probed.
 */
export async function updateGuideRequest(user, requestId, status) {
  const request = await guideRepository.findRequest(requestId);
  const isGuide = request?.guide.userId === user.id;
  const isTourist = request?.touristId === user.id;
  if (!request || (!isGuide && !isTourist)) throw notFoundError("We couldn't find that request");

  if (status === "CANCELLED") {
    if (!isTourist) throw forbiddenError("Only the traveler can cancel a request");
    if (!["NEW", "ACCEPTED"].includes(request.status)) throw badRequest("This request is already closed");
  } else {
    if (!isGuide) throw forbiddenError("Only the guide can respond to a request");
    if (request.status !== "NEW") throw badRequest("You've already responded to this request");
  }

  return guideRepository.updateRequestStatus(requestId, status);
}

/** The guide's inbox. A traveler's email and phone appear only once the guide has accepted. */
export async function listGuideInbox(user) {
  const profile = await guideRepository.findProfileByUserId(user.id);
  if (!profile) return { profile: null, requests: [] };

  const requests = await guideRepository.listRequestsForGuide(profile.id);
  return {
    profile,
    requests: requests.map(({ tourist, ...request }) => ({
      ...request,
      tourist: request.status === "ACCEPTED" ? tourist : { fullName: tourist.fullName },
    })),
  };
}

/** A traveler's requests. The guide's phone and email appear only once the guide has accepted. */
export async function listMyGuideRequests(user) {
  const requests = await guideRepository.listRequestsForTourist(user.id);

  return requests.map(({ guide, ...request }) => ({
    ...request,
    guide: {
      id: guide.id,
      name: guide.user.fullName,
      headline: guide.headline,
      photoUrl: guide.photoUrl,
      ...(request.status === "ACCEPTED" ? { phone: guide.phone, email: guide.user.email } : {}),
    },
  }));
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function listGuidesForAdmin(query = {}) {
  const { page, limit, skip } = getPagination(query, 20);
  const { items, total } = await guideRepository.listGuidesForAdmin({ status: query.status, search: query.search, skip, take: limit });
  return { data: items, meta: buildMeta({ page, limit, total }) };
}

/** Approving makes the account a GUIDE; un-approving turns a guide back into a TOURIST. Admins keep their role. */
export async function moderateGuide(id, { status }) {
  const profile = await guideRepository.findProfileById(id);
  if (!profile) throw notFoundError("Guide profile not found");

  const updated = await guideRepository.setProfileStatus(id, status);
  const role = profile.user.role;

  if (status === "APPROVED" && role === "TOURIST") await userRepository.updateUser(profile.userId, { role: "GUIDE" });
  if (status !== "APPROVED" && role === "GUIDE") await userRepository.updateUser(profile.userId, { role: "TOURIST" });

  return updated;
}

export async function deleteGuideProfile(id) {
  const profile = await guideRepository.findProfileById(id);
  if (!profile) throw notFoundError("Guide profile not found");
  await guideRepository.deleteProfile(id);
  if (profile.user.role === "GUIDE") await userRepository.updateUser(profile.userId, { role: "TOURIST" });
  return { id };
}
