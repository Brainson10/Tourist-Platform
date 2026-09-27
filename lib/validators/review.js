import { z } from "zod";
import { REVIEW_STATUSES, imageUrlSchema, optionalText, pageQuery } from "@/lib/validators/common";

export const reviewSchema = z.object({
  rating: z.coerce.number({ error: "Choose a rating" }).int("Choose a whole-star rating").min(1, "Choose a rating from 1 to 5").max(5, "Choose a rating from 1 to 5"),
  title: optionalText(120),
  comment: z.string({ error: "Tell other travelers about your visit" }).trim().min(10, "Write at least 10 characters").max(2000, "Keep your review under 2000 characters"),
  photos: z.array(imageUrlSchema).max(4, "Add up to 4 photos").optional().default([]),
});

export const reviewQuerySchema = z.object({ ...pageQuery });

export const reviewModerationSchema = z.object({
  status: z.enum(REVIEW_STATUSES),
});
