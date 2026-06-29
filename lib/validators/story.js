import { z } from "zod";
import { listQuerySchema, requireAtLeastOneField } from "@/lib/validators/common";

export const storySchema = z.object({
  destinationId: z.string().trim().min(1, "Destination id is required"),
  title: z.string().trim().min(1, "Story title is required"),
  content: z.string().trim().min(1, "Story content is required"),
  language: z.string().trim().min(1, "Language is required"),
});

export const createStorySchema = storySchema;

export const updateStorySchema = requireAtLeastOneField(storySchema.partial());

export const storyQuerySchema = listQuerySchema.extend({
  destinationId: z.string().trim().min(1).optional(),
  language: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});
