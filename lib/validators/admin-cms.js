import { z } from "zod";
import { idParamSchema, requireAtLeastOneField } from "@/lib/validators/common";

export const adminResourceParamSchema = z.object({
  resource: z.enum(["villages", "categories", "festivals", "experiences", "stories", "reviews", "users", "settings"]),
});

export const adminResourceIdParamSchema = adminResourceParamSchema.merge(idParamSchema);

const experienceCategory = z.enum(["ADVENTURE", "CULTURE", "FOOD", "NATURE", "FESTIVAL", "WILDLIFE", "SPIRITUAL"]);
const userRole = z.enum(["TOURIST", "ADMIN", "GUIDE", "GOVERNMENT"]);
const reviewStatus = z.enum(["PENDING", "APPROVED", "HIDDEN"]);

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().min(1).optional(),
  destinationId: z.string().trim().min(1).optional(),
  category: experienceCategory.optional(),
  status: reviewStatus.optional(),
  role: userRole.optional(),
  isBlocked: z.coerce.boolean().optional(),
  district: z.string().trim().min(1).optional(),
});

export const villageSchema = z.object({
  name: z.string().trim().min(1, "Village name is required"),
  district: z.string().trim().min(1, "District is required"),
  state: z.string().trim().min(1, "State is required"),
  pincode: z.string().trim().optional(),
  description: z.string().trim().optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  slug: z.string().trim().min(1, "Slug is required"),
  icon: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

const festivalAdminBaseSchema = z.object({
    destinationId: z.string().trim().min(1, "Destination is required"),
    title: z.string().trim().min(1, "Festival title is required"),
    slug: z.string().trim().min(1, "Slug is required"),
    description: z.string().trim().min(1, "Description is required"),
    imageUrl: z.string().trim().url("Image URL must be valid"),
    category: experienceCategory,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    isFeatured: z.coerce.boolean().optional(),
  });

export const festivalAdminSchema = festivalAdminBaseSchema.refine((value) => value.endDate >= value.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export const experienceAdminSchema = z.object({
  destinationId: z.string().trim().min(1, "Destination is required"),
  title: z.string().trim().min(1, "Experience title is required"),
  description: z.string().trim().min(1, "Description is required"),
  category: experienceCategory,
  difficulty: z.string().trim().min(1, "Difficulty is required"),
  duration: z.string().trim().min(1, "Duration is required"),
  price: z.coerce.number().nonnegative("Price must be non-negative"),
});

export const storyAdminSchema = z.object({
  destinationId: z.string().trim().min(1, "Destination is required"),
  title: z.string().trim().min(1, "Story title is required"),
  content: z.string().trim().min(1, "Story content is required"),
  language: z.string().trim().min(1, "Language is required"),
});

export const reviewAdminSchema = z.object({
  status: reviewStatus,
});

export const userAdminSchema = z.object({
  role: userRole.optional(),
  isBlocked: z.coerce.boolean().optional(),
});

export const settingsSchema = z.object({
  platformName: z.string().trim().min(1, "Platform name is required"),
  supportEmail: z.string().trim().email("Support email must be valid"),
  defaultState: z.string().trim().min(1, "Default state is required"),
  emergencyHelpline: z.string().trim().min(1, "Emergency helpline is required"),
});

export const createSchemas = {
  villages: villageSchema,
  categories: categorySchema,
  festivals: festivalAdminSchema,
  experiences: experienceAdminSchema,
  stories: storyAdminSchema,
  settings: settingsSchema,
};

export const updateSchemas = {
  villages: requireAtLeastOneField(villageSchema.partial()),
  categories: requireAtLeastOneField(categorySchema.partial()),
  festivals: requireAtLeastOneField(
    festivalAdminBaseSchema.partial().refine((value) => !value.startDate || !value.endDate || value.endDate >= value.startDate, {
      message: "End date must be on or after start date",
      path: ["endDate"],
    })
  ),
  experiences: requireAtLeastOneField(experienceAdminSchema.partial()),
  stories: requireAtLeastOneField(storyAdminSchema.partial()),
  reviews: reviewAdminSchema,
  users: requireAtLeastOneField(userAdminSchema),
  settings: settingsSchema,
};
