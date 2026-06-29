import { z } from "zod";
import { listQuerySchema, requireAtLeastOneField } from "@/lib/validators/common";

const festivalBaseSchema = z
  .object({
    destinationId: z.string().trim().min(1, "Destination id is required"),
    title: z.string().trim().min(1, "Festival title is required"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    description: z.string().trim().min(1, "Description is required"),
  });

function dateRangeIsValid(value) {
  if (!value.startDate || !value.endDate) {
    return true;
  }

  return value.endDate >= value.startDate;
}

export const festivalSchema = festivalBaseSchema.refine(dateRangeIsValid, {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

export const createFestivalSchema = festivalSchema;

export const updateFestivalSchema = requireAtLeastOneField(
  festivalBaseSchema.partial().refine(dateRangeIsValid, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  })
);

export const festivalQuerySchema = listQuerySchema.extend({
  destinationId: z.string().trim().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().trim().min(1).optional(),
});
