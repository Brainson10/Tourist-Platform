import { z } from "zod";
import {
  EXPERIENCE_CATEGORIES,
  idSchema,
  optionalDate,
  optionalImageUrl,
  optionalText,
  pageQuery,
  queryBoolean,
  requiredText,
  searchText,
  slugSchema,
} from "@/lib/validators/common";

const category = z.enum(EXPERIENCE_CATEGORIES, { error: "Choose a category" });

export const experienceSchema = z.object({
  destinationId: idSchema,
  title: requiredText("Title", 140),
  description: requiredText("Description", 5000),
  category,
  difficulty: optionalText(40),
  duration: optionalText(60),
  price: z
    .union([z.literal(""), z.null(), z.coerce.number().min(0, "Price can't be negative").max(1_000_000)])
    .optional()
    .transform((value) => (value === "" || value === undefined ? null : value)),
  imageUrl: optionalImageUrl,
});

export const experienceQuerySchema = z.object({
  ...pageQuery,
  search: searchText,
  category: z.enum(EXPERIENCE_CATEGORIES).optional(),
  destinationId: idSchema.optional(),
  destination: z.string().trim().max(120).optional(),
});

export const festivalSchema = z
  .object({
    destinationId: idSchema,
    title: requiredText("Title", 140),
    slug: slugSchema,
    description: requiredText("Description", 5000),
    significance: optionalText(5000),
    imageUrl: optionalImageUrl,
    category: category.optional().default("FESTIVAL"),
    startDate: optionalDate,
    endDate: optionalDate,
    isFeatured: z.boolean().optional().default(false),
  })
  .refine((value) => !value.endDate || !value.startDate || value.endDate >= value.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  })
  .refine((value) => !value.endDate || value.startDate, {
    message: "Add a start date before an end date",
    path: ["startDate"],
  });

export const festivalQuerySchema = z.object({
  ...pageQuery,
  search: searchText,
  category: z.enum(EXPERIENCE_CATEGORIES).optional(),
  destinationId: idSchema.optional(),
  featured: queryBoolean,
  when: z.enum(["upcoming", "past", "all"]).optional(),
});

export const storySchema = z.object({
  destinationId: idSchema,
  title: requiredText("Title", 160),
  slug: slugSchema,
  excerpt: optionalText(300),
  content: requiredText("Story", 30_000),
  coverImage: optionalImageUrl,
  authorName: optionalText(80),
  language: z.string().trim().max(40).optional().transform((value) => value || "English"),
});

export const storyQuerySchema = z.object({
  ...pageQuery,
  search: searchText,
  destinationId: idSchema.optional(),
});
