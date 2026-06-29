import { z } from "zod";
import { listQuerySchema, requireAtLeastOneField } from "@/lib/validators/common";

export const experienceSchema = z.object({
  destinationId: z.string().trim().min(1, "Destination id is required"),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  category: z.enum(["ADVENTURE", "CULTURE", "FOOD", "NATURE", "FESTIVAL", "WILDLIFE", "SPIRITUAL"]),
  difficulty: z.string().trim().min(1, "Difficulty is required"),
  duration: z.string().trim().min(1, "Duration is required"),
  price: z.coerce.number().nonnegative("Price must be non-negative"),
});

export const createExperienceSchema = experienceSchema;

export const updateExperienceSchema = requireAtLeastOneField(experienceSchema.partial());

export const experienceQuerySchema = listQuerySchema.extend({
  destinationId: z.string().trim().min(1).optional(),
  category: z.enum(["ADVENTURE", "CULTURE", "FOOD", "NATURE", "FESTIVAL", "WILDLIFE", "SPIRITUAL"]).optional(),
  search: z.string().trim().min(1).optional(),
});
