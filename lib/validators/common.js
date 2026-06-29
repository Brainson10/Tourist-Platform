import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().trim().min(1, "Id is required"),
});

export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export function requireAtLeastOneField(schema, message = "At least one field must be provided") {
  return schema.refine((value) => Object.keys(value).length > 0, {
    message,
  });
}
