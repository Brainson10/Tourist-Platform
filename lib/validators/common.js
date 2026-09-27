import { z } from "zod";

export const EXPERIENCE_CATEGORIES = ["ADVENTURE", "CULTURE", "FOOD", "NATURE", "FESTIVAL", "WILDLIFE", "SPIRITUAL"];
export const USER_ROLES = ["TOURIST", "GUIDE", "ADMIN"];
export const REVIEW_STATUSES = ["PENDING", "APPROVED", "HIDDEN"];
export const TRIP_STATUSES = ["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"];

export const idSchema = z.string().trim().min(1, "Id is required").max(64, "Id is too long");
export const idParamSchema = z.object({ id: idSchema });

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required")
  .max(120, "Slug is too long")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only");

export const requiredText = (label, max = 5000) =>
  z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`).max(max, `${label} is too long`);

/** Optional text: "" and null become null so the value is cleared. */
export const optionalText = (max = 5000) =>
  z
    .union([z.string().trim().max(max, `Keep this under ${max} characters`), z.null()])
    .optional()
    .transform((value) => (value === undefined ? undefined : value || null));

const httpsUrl = z
  .string()
  .trim()
  .max(2000, "Link is too long")
  .refine((value) => /^https:\/\/[^\s]+$/i.test(value), "Use a full https:// link");

/** A hosted https image, or a file uploaded to this server's /uploads folder (development storage). */
const imageUrl = z
  .string()
  .trim()
  .max(2000, "Link is too long")
  .refine(
    (value) => /^https:\/\/[^\s]+$/i.test(value) || /^\/uploads\/[a-z]+\/[A-Za-z0-9_-]+\.(jpg|png|webp|avif)$/.test(value),
    "Use a full https:// link or upload an image"
  );

export const imageUrlSchema = imageUrl;

export const optionalImageUrl = z
  .union([imageUrl, z.literal(""), z.null()])
  .optional()
  .transform((value) => (value === undefined ? undefined : value || null));

/** Accepts an array or a comma/newline separated string. */
export const stringList = (maxItems = 30, maxLength = 300) =>
  z
    .union([z.array(z.string()), z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (value == null) return [];
      const items = Array.isArray(value) ? value : value.split(/[\n,]/);
      return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
    })
    .pipe(z.array(z.string().max(maxLength, `Keep each item under ${maxLength} characters`)).max(maxItems, `Add at most ${maxItems} items`));

export const optionalDate = z
  .union([z.literal(""), z.null(), z.coerce.date({ error: "Enter a valid date" })])
  .optional()
  .transform((value) => (value === undefined ? undefined : value || null));

/** Query-string boolean: "true"/"1" → true, "false"/"0" → false. */
export const queryBoolean = z.stringbool({ truthy: ["true", "1", "yes"], falsy: ["false", "0", "no"] }).optional();

export const pageQuery = {
  page: z.coerce.number().int().min(1).max(10_000).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
};

export const searchText = z.string().trim().max(120).optional().transform((value) => value || undefined);

export { slugify } from "@/lib/utils/slugify";
