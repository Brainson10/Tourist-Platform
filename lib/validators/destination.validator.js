import { z } from "zod";
import { idParamSchema, requireAtLeastOneField } from "@/lib/validators/common";

const trimmedString = (message) => z.string().trim().min(1, message);
const optionalTrimmedString = z.string().trim().optional();
const optionalUrl = z
  .union([z.string().trim().url("Image URL must be valid"), z.literal("")])
  .optional()
  .transform((value) => value || undefined);

const stringList = z
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

const jsonValue = z.unknown().optional();

const destinationPayloadBaseSchema = z.object({
  name: trimmedString("Destination name is required"),
  slug: trimmedString("Destination slug is required"),
  description: trimmedString("Description is required"),
  shortDescription: trimmedString("Short description is required"),
  fullDescription: trimmedString("Full description is required"),
  villageId: optionalTrimmedString,
  villageName: optionalTrimmedString,
  state: optionalTrimmedString,
  district: optionalTrimmedString,
  latitude: z.coerce.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),
  bestSeason: optionalTrimmedString,
  openingHours: optionalTrimmedString,
  estimatedDuration: optionalTrimmedString,
  entryFee: optionalTrimmedString,
  accessibility: optionalTrimmedString,
  safetyInfo: optionalTrimmedString,
  coverImage: optionalUrl,
  heroImage: optionalUrl,
  emergencyContacts: jsonValue,
  tags: stringList,
  galleryImages: stringList,
  categoryIds: stringList,
  categories: stringList,
  history: optionalTrimmedString,
  culture: optionalTrimmedString,
  religion: optionalTrimmedString,
  traditions: optionalTrimmedString,
  language: optionalTrimmedString,
  food: optionalTrimmedString,
  thingsToDo: stringList,
  nearbyAttractions: stringList,
  transportation: optionalTrimmedString,
  hotels: jsonValue,
  homestays: jsonValue,
  hiddenGems: stringList,
  isFeatured: z.coerce.boolean().optional(),
});

function validateTypedVillage(data, context) {
  if (data.villageName && !data.district) {
    context.addIssue({
      code: "custom",
      path: ["district"],
      message: "District is required when adding a village by name",
    });
  }

  if (data.villageName && !data.state) {
    context.addIssue({
      code: "custom",
      path: ["state"],
      message: "State is required when adding a village by name",
    });
  }
}

export const destinationPayloadSchema = destinationPayloadBaseSchema.superRefine((data, context) => {
  if (!data.villageId && !data.villageName) {
    context.addIssue({
      code: "custom",
      path: ["villageName"],
      message: "Village name is required",
    });
  }

  validateTypedVillage(data, context);
});

export const createDestinationSchema = destinationPayloadSchema;
export const updateDestinationSchema = requireAtLeastOneField(destinationPayloadBaseSchema.partial().superRefine(validateTypedVillage));

export const destinationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().min(1).optional(),
  featured: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  village: z.string().trim().min(1).optional(),
  villageId: z.string().trim().min(1).optional(),
  district: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  sort: z.enum(["name", "rating", "createdAt"]).optional(),
});

export const destinationSearchSchema = destinationQuerySchema.extend({
  q: z.string().trim().min(1).optional(),
});

export const nearbyDestinationQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().max(500).optional(),
  radiusKm: z.coerce.number().positive().max(500).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  excludeId: z.string().trim().min(1).optional(),
  excludeSlug: z.string().trim().min(1).optional(),
});

export const destinationIdParamSchema = idParamSchema;

export const destinationSlugOrIdParamSchema = z.object({
  id: z.string().trim().min(1, "Destination slug or id is required"),
});
