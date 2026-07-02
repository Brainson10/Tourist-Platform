import { z } from "zod";
import { listQuerySchema, requireAtLeastOneField } from "@/lib/validators/common";

const optionalUrlSchema = z.string().trim().url().optional().or(z.literal(""));
const stringListSchema = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value) => {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.map((item) => item.trim()).filter(Boolean);
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  });

export const destinationSchema = z.object({
  name: z.string().trim().min(1, "Destination name is required"),
  slug: z.string().trim().min(1, "Destination slug is required"),
  description: z.string().trim().min(1, "Description is required"),
  shortDescription: z.string().trim().min(1, "Short description is required").optional(),
  fullDescription: z.string().trim().min(1, "Full description is required").optional(),
  state: z.string().trim().min(1, "State is required"),
  district: z.string().trim().min(1, "District is required"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  coverImage: optionalUrlSchema,
  heroImage: optionalUrlSchema,
  galleryImages: stringListSchema,
  bestSeason: z.string().trim().optional(),
  openingHours: z.string().trim().optional(),
  estimatedDuration: z.string().trim().optional(),
  entryFee: z.string().trim().optional(),
  accessibility: z.string().trim().optional(),
  safetyInfo: z.string().trim().optional(),
  emergencyContacts: z.unknown().optional(),
  tags: stringListSchema,
  categories: stringListSchema,
  history: z.string().trim().optional(),
  culture: z.string().trim().optional(),
  religion: z.string().trim().optional(),
  traditions: z.string().trim().optional(),
  language: z.string().trim().optional(),
  food: z.string().trim().optional(),
  thingsToDo: stringListSchema,
  nearbyAttractions: stringListSchema,
  transportation: z.string().trim().optional(),
  hotels: z.unknown().optional(),
  homestays: z.unknown().optional(),
  hiddenGems: stringListSchema,
  isFeatured: z.coerce.boolean().optional(),
});

export const createDestinationSchema = destinationSchema;

export const updateDestinationSchema = requireAtLeastOneField(destinationSchema.partial());

export const destinationQuerySchema = listQuerySchema.extend({
  state: z.string().trim().min(1).optional(),
  district: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  tag: z.string().trim().min(1).optional(),
  isFeatured: z.coerce.boolean().optional(),
  search: z.string().trim().min(1).optional(),
});

export const destinationSearchSchema = listQuerySchema.extend({
  q: z.string().trim().min(2, "Search query must be at least 2 characters"),
  category: z.string().trim().min(1).optional(),
  state: z.string().trim().min(1).optional(),
  district: z.string().trim().min(1).optional(),
});

export const destinationFilterSchema = destinationQuerySchema.extend({
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(500).optional(),
});

export const destinationSlugParamSchema = z.object({
  slug: z.string().trim().min(1, "Destination slug is required"),
});
