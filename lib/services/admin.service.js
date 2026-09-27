import { badRequest } from "@/lib/api/errors";
import * as statsRepository from "@/lib/repositories/stats.repository";
import * as destinationService from "@/lib/services/destination.service";
import * as experienceService from "@/lib/services/experience.service";
import * as festivalService from "@/lib/services/festival.service";
import * as guideService from "@/lib/services/guide.service";
import * as permitService from "@/lib/services/permit.service";
import * as placeService from "@/lib/services/place.service";
import * as reviewService from "@/lib/services/review.service";
import * as storyService from "@/lib/services/story.service";
import * as userAdminService from "@/lib/services/user-admin.service";
import { categorySchema, permitSchema, userAdminSchema, villageSchema } from "@/lib/validators/admin";
import { experienceSchema, festivalSchema, storySchema } from "@/lib/validators/content";
import { destinationSchema } from "@/lib/validators/destination";
import { guideModerationSchema } from "@/lib/validators/guide";
import { reviewModerationSchema } from "@/lib/validators/review";

/**
 * One entry per CMS resource. Every mutation goes through the owning domain
 * service, so the admin API and the rest of the app share the same rules.
 */
export const ADMIN_REGISTRY = {
  destinations: {
    schema: destinationSchema,
    list: destinationService.listDestinationsForAdmin,
    get: destinationService.getDestinationForAdmin,
    create: destinationService.createDestination,
    update: destinationService.updateDestination,
    remove: destinationService.deleteDestination,
  },
  villages: {
    schema: villageSchema,
    list: placeService.listVillages,
    create: placeService.createVillage,
    update: placeService.updateVillage,
    remove: placeService.deleteVillage,
  },
  categories: {
    schema: categorySchema,
    list: placeService.listCategories,
    create: placeService.createCategory,
    update: placeService.updateCategory,
    remove: placeService.deleteCategory,
  },
  experiences: {
    schema: experienceSchema,
    list: experienceService.listExperiences,
    get: experienceService.getExperience,
    create: experienceService.createExperience,
    update: experienceService.updateExperience,
    remove: experienceService.deleteExperience,
  },
  festivals: {
    schema: festivalSchema,
    list: (query) => festivalService.listFestivals({ ...query, when: "all" }),
    create: festivalService.createFestival,
    update: festivalService.updateFestival,
    remove: festivalService.deleteFestival,
  },
  stories: {
    schema: storySchema,
    list: storyService.listStories,
    create: storyService.createStory,
    update: storyService.updateStory,
    remove: storyService.deleteStory,
  },
  reviews: {
    schema: reviewModerationSchema,
    list: reviewService.listReviewsForAdmin,
    update: (id, input) => reviewService.moderateReview(id, input.status),
    remove: reviewService.deleteReviewAsAdmin,
  },
  users: {
    schema: userAdminSchema,
    list: userAdminService.listUsers,
    update: userAdminService.updateUserAccess,
  },
  guides: {
    schema: guideModerationSchema,
    list: guideService.listGuidesForAdmin,
    update: guideService.moderateGuide,
    remove: guideService.deleteGuideProfile,
  },
  permits: {
    schema: permitSchema,
    list: permitService.listPermits,
    create: permitService.createPermit,
    update: permitService.updatePermit,
    remove: permitService.deletePermit,
  },
};

export function getResourceHandler(resource, operation) {
  const handler = ADMIN_REGISTRY[resource]?.[operation];

  if (!handler) {
    throw badRequest(`You can't ${operation === "remove" ? "delete" : operation} ${resource} here`);
  }

  return handler;
}

export async function getAdminOverview() {
  const [counts, pending, incomplete] = await Promise.all([
    statsRepository.countEverything(),
    reviewService.listReviewsForAdmin({ status: "PENDING", limit: 5 }),
    statsRepository.findIncompleteDestinations(5),
  ]);

  return { counts, pendingReviews: pending.data, incompleteDestinations: incomplete };
}

export function getAdminCounts() {
  return statsRepository.countEverything();
}
