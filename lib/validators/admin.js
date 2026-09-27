import { z } from "zod";
import {
  EXPERIENCE_CATEGORIES,
  REVIEW_STATUSES,
  USER_ROLES,
  idSchema,
  optionalText,
  pageQuery,
  queryBoolean,
  requiredText,
  searchText,
  slugSchema,
} from "@/lib/validators/common";

export const ADMIN_RESOURCES = [
  "destinations",
  "villages",
  "categories",
  "experiences",
  "festivals",
  "stories",
  "reviews",
  "users",
  "permits",
  "guides",
];

export const adminResourceParamSchema = z.object({ resource: z.enum(ADMIN_RESOURCES) });
export const adminResourceIdParamSchema = adminResourceParamSchema.extend({ id: idSchema });

export const adminListQuerySchema = z.object({
  ...pageQuery,
  search: searchText,
  destinationId: idSchema.optional(),
  category: z.string().trim().max(60).optional(),
  // Review statuses, or guide statuses on the guides page.
  status: z.enum([...REVIEW_STATUSES, "REJECTED"]).optional(),
  role: z.enum(USER_ROLES).optional(),
  blocked: queryBoolean,
  state: z.string().trim().max(80).optional(),
  featured: queryBoolean,
});

export const villageSchema = z.object({
  name: requiredText("Village name", 120),
  district: requiredText("District", 120),
  state: requiredText("State", 120),
  pincode: optionalText(12),
  description: optionalText(2000),
  latitude: z.coerce.number({ error: "Latitude is required" }).min(-90).max(90),
  longitude: z.coerce.number({ error: "Longitude is required" }).min(-180).max(180),
});

export const categorySchema = z.object({
  name: requiredText("Category name", 60),
  slug: slugSchema,
  icon: optionalText(40),
  description: optionalText(500),
});

export const userAdminSchema = z
  .object({
    role: z.enum(USER_ROLES).optional(),
    isBlocked: z.boolean().optional(),
  })
  .refine((value) => value.role !== undefined || value.isBlocked !== undefined, "Nothing to update");

const optionalHttpsUrl = z
  .union([z.literal(""), z.null(), z.string().trim().max(500).refine((value) => /^https:\/\/\S+$/i.test(value), "Use a full https:// link")])
  .optional()
  .transform((value) => value || null);

export const permitSchema = z.object({
  state: requiredText("State", 80),
  required: z.boolean(),
  permitName: optionalText(120),
  whoNeedsIt: optionalText(1000),
  howToApply: optionalText(2000),
  applyUrl: optionalHttpsUrl,
  fee: optionalText(200),
  processingTime: optionalText(200),
  foreignersNote: optionalText(1000),
  lastVerifiedAt: z
    .union([z.literal(""), z.null(), z.coerce.date({ error: "Enter a valid date" })])
    .optional()
    .transform((value) => value || null),
});

export const settingsSchema = z.object({
  supportEmail: z.union([z.literal(""), z.email("Enter a valid email")]).transform((value) => value || null),
  supportPhone: optionalText(30),
  emergencyNumber: requiredText("Emergency number", 20),
  touristHelpline: optionalText(30),
  autoApproveReviews: z.boolean(),
  defaultDailyBudget: z.coerce.number().int().min(0).max(1_000_000).optional().default(2500),
});

export { EXPERIENCE_CATEGORIES };
