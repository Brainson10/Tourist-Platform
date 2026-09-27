import { z } from "zod";
import {
  idSchema,
  imageUrlSchema,
  optionalImageUrl,
  optionalText,
  pageQuery,
  queryBoolean,
  requiredText,
  searchText,
  slugSchema,
  stringList,
} from "@/lib/validators/common";

const stayRecord = z.object({
  name: requiredText("Stay name", 120),
  type: optionalText(80),
  contact: optionalText(120),
  address: optionalText(200),
  note: optionalText(300),
});

const emergencyRecord = z.object({
  label: requiredText("Contact label", 80),
  value: requiredText("Contact number or detail", 120),
  note: optionalText(200),
});

const recordList = (schema) =>
  z
    .union([z.array(schema), z.null()])
    .optional()
    .transform((value) => value ?? [])
    .pipe(z.array(schema).max(30, "Add at most 30 entries"));

export const destinationSchema = z.object({
  name: requiredText("Name", 120),
  slug: slugSchema.refine((slug) => !["surprise", "map", "nearby"].includes(slug), "This URL is reserved. Choose another slug."),
  shortDescription: requiredText("Short summary", 280),
  description: requiredText("Description", 10_000),
  villageId: idSchema,
  latitude: z.coerce.number({ error: "Latitude is required" }).min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce.number({ error: "Longitude is required" }).min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),
  coverImage: optionalImageUrl,
  // Legacy: plain list of image links. `photos` (with captions) takes precedence.
  galleryImages: z.array(imageUrlSchema).max(20, "Add at most 20 photos").optional().default([]),
  photos: z
    .array(z.object({ url: imageUrlSchema, caption: optionalText(200) }))
    .max(20, "Add at most 20 photos")
    .optional(),
  categoryIds: z.array(idSchema).max(10, "Choose at most 10 categories").optional().default([]),
  bestSeason: optionalText(200),
  bestMonths: z
    .array(z.coerce.number().int().min(1).max(12))
    .max(12)
    .optional()
    .default([])
    .transform((months) => [...new Set(months)].sort((first, second) => first - second)),
  openingHours: optionalText(300),
  estimatedDuration: optionalText(120),
  entryFee: optionalText(300),
  accessibility: optionalText(2000),
  safetyInfo: optionalText(3000),
  transportation: optionalText(3000),
  history: optionalText(8000),
  culture: optionalText(8000),
  religion: optionalText(4000),
  traditions: optionalText(4000),
  language: optionalText(1000),
  food: optionalText(4000),
  tags: stringList(20, 40),
  thingsToDo: stringList(30, 200),
  nearbyAttractions: stringList(30, 200),
  hiddenGems: stringList(30, 200),
  hotels: recordList(stayRecord),
  homestays: recordList(stayRecord),
  emergencyContacts: recordList(emergencyRecord),
  isFeatured: z.boolean().optional().default(false),
});

export const DESTINATION_SORTS = ["recommended", "rating", "name", "newest"];

export const destinationQuerySchema = z.object({
  ...pageQuery,
  search: searchText,
  q: searchText,
  category: z.string().trim().max(60).optional(),
  state: z.string().trim().max(80).optional(),
  district: z.string().trim().max(80).optional(),
  villageId: idSchema.optional(),
  featured: queryBoolean,
  sort: z.enum(DESTINATION_SORTS).optional(),
  view: z.enum(["list", "map"]).optional(),
  // "lat,lng" from the "Near me" button.
  near: z
    .string()
    .regex(/^-?\d{1,2}(\.\d+)?,-?\d{1,3}(\.\d+)?$/)
    .transform((value) => value.split(",").map(Number))
    .refine(([latitude, longitude]) => Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180)
    .optional(),
});

export const nearbyDestinationQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(500).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  excludeId: idSchema.optional(),
});

export const NEARBY_PLACE_TYPES = ["hospital", "police", "restaurant", "hotel", "attraction", "transport", "atm"];

export const nearbyPlacesQuerySchema = z.object({
  type: z.enum(NEARBY_PLACE_TYPES),
  radiusKm: z.coerce.number().min(1).max(25).optional(),
});
