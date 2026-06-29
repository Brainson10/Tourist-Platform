import { z } from "zod";
import { listQuerySchema, requireAtLeastOneField } from "@/lib/validators/common";

const tripBaseSchema = z.object({
  userId: z.string().trim().min(1, "User id is required"),
  title: z.string().trim().min(1, "Title is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
});

function dateRangeIsValid(value) {
  if (!value.startDate || !value.endDate) {
    return true;
  }

  return value.endDate >= value.startDate;
}

export const tripSchema = tripBaseSchema.refine(dateRangeIsValid, {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

const createTripBaseSchema = tripBaseSchema.omit({ userId: true });

export const createTripSchema = createTripBaseSchema.refine(dateRangeIsValid, {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

export const updateTripSchema = requireAtLeastOneField(
  createTripBaseSchema.partial().refine(dateRangeIsValid, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  })
);

export const tripQuerySchema = listQuerySchema.extend({
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
});
