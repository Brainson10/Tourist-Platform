import { z } from "zod";
import { AUDIENCES, AVAILABILITY, BUDGET_BANDS, CATEGORY_ICONS, INTERESTS, PHOTO_KINDS, QUALITIES, SELLER_KINDS, fromParam, values } from "@/lib/constants/souvenirs";
import { idSchema, imageUrlSchema, optionalImageUrl, optionalText, pageQuery, requiredText, searchText, slugSchema } from "@/lib/validators/common";

const RESERVED_SLUGS = ["recommend", "help", "new"];

const price = z
  .union([z.literal(""), z.null(), z.coerce.number({ error: "Enter a number" }).int("Use whole rupees").min(0, "Price can't be negative").max(10_000_000, "That's too high")])
  .optional()
  .transform((value) => (value === "" || value === undefined ? null : value));

const enumList = (list, max) =>
  z
    .array(z.enum(values(list)))
    .max(max)
    .optional()
    .default([])
    .transform((items) => [...new Set(items)]);

export const souvenirSchema = z
  .object({
    name: requiredText("Name", 120),
    slug: slugSchema.refine((slug) => !RESERVED_SLUGS.includes(slug), "This URL is reserved. Choose another slug."),
    shortDescription: requiredText("Short description", 200),
    description: requiredText("Description", 5000),
    whySpecial: requiredText("Why it's special", 2000),
    whyTakeHome: requiredText("Why take it home", 1000),
    authenticityTips: optionalText(1500),
    carryTips: optionalText(1000),
    categoryId: idSchema,
    destinationIds: z.array(idSchema).min(1, "Link at least one destination").max(20).transform((ids) => [...new Set(ids)]),
    sellers: z
      .array(z.object({ sellerId: idSchema, note: optionalText(200) }))
      .max(20)
      .optional()
      .default([]),
    priceMin: price,
    priceMax: price,
    audiences: enumList(AUDIENCES, AUDIENCES.length),
    interests: enumList(INTERESTS, INTERESTS.length),
    qualities: enumList(QUALITIES, QUALITIES.length),
    availability: z.enum(values(AVAILABILITY)).optional().default("YEAR_ROUND"),
    availabilityNote: optionalText(200),
    coverImage: optionalImageUrl,
    photos: z
      .array(z.object({ url: imageUrlSchema, caption: optionalText(200), kind: z.enum(values(PHOTO_KINDS)).optional().default("PRODUCT") }))
      .max(12, "Add at most 12 photos")
      .optional()
      .default([]),
    isFeatured: z.boolean().optional().default(false),
    isPublished: z.boolean().optional().default(true),
    needsVerification: z.boolean().optional().default(false),
  })
  .refine((value) => value.priceMin === null || value.priceMax === null || value.priceMax >= value.priceMin, {
    message: "The highest price must be at least the lowest price",
    path: ["priceMax"],
  })
  .refine((value) => new Set(value.sellers.map((seller) => seller.sellerId)).size === value.sellers.length, {
    message: "Each place can only be added once",
    path: ["sellers"],
  });

export const souvenirCategorySchema = z.object({
  name: requiredText("Name", 60),
  slug: slugSchema,
  description: optionalText(300),
  icon: z
    .union([z.literal(""), z.null(), z.enum(values(CATEGORY_ICONS), { error: "Choose an icon from the list" })])
    .optional()
    .transform((value) => value || null),
});

export const sellerSchema = z.object({
  name: requiredText("Name", 120),
  slug: slugSchema,
  kind: z.enum(values(SELLER_KINDS), { error: "Choose what kind of place this is" }),
  description: optionalText(1000),
  address: optionalText(300),
  villageId: z.union([idSchema, z.literal(""), z.null()]).optional().transform((value) => value || null),
  latitude: z.coerce.number({ error: "Latitude is required" }).min(-90).max(90),
  longitude: z.coerce.number({ error: "Longitude is required" }).min(-180).max(180),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+0-9 ()-]*$/, "Use digits, spaces and + only")
    .optional()
    .transform((value) => value || null),
  website: z
    .union([z.literal(""), z.null(), z.string().trim().max(300).refine((value) => /^https:\/\/\S+$/i.test(value), "Use a full https:// link")])
    .optional()
    .transform((value) => value || null),
  openingHours: optionalText(200),
  isVerified: z.boolean().optional().default(false),
});

/** Readable URL params (?for=family&budget=500-1000) become enum values here. */
const param = (list) =>
  z
    .string()
    .optional()
    .transform((value) => (value ? fromParam(list, value) : undefined))
    .refine((value) => value !== null, "Unknown option");

export const souvenirQuerySchema = z.object({
  ...pageQuery,
  q: searchText,
  destination: z.string().trim().max(120).optional(),
  state: z.string().trim().max(80).optional(),
  category: z.string().trim().max(60).optional(),
  budget: z.enum(values(BUDGET_BANDS)).optional(),
  for: param(AUDIENCES),
  quality: param(QUALITIES),
  interest: param(INTERESTS),
});

export const souvenirRecommendSchema = z.object({
  destination: z.string().trim().max(120).optional(),
  state: z.string().trim().max(80).optional(),
  budget: z.enum(values(BUDGET_BANDS)).optional(),
  for: param(AUDIENCES),
  interest: param(INTERESTS),
  limit: z.coerce.number().int().min(1).max(12).optional(),
});

export const slugParamSchema = z.object({ slug: z.string().trim().min(1).max(120) });
