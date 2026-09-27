import { z } from "zod";
import { TRIP_STATUSES, idSchema, optionalText, requiredText } from "@/lib/validators/common";

const MAX_TRIP_DAYS = 60;

const tripFields = {
  title: requiredText("Trip name", 120),
  destinationId: z
    .union([idSchema, z.literal(""), z.null()])
    .optional()
    .transform((value) => (value === undefined ? undefined : value || null)),
  startDate: z.coerce.date({ error: "Choose a start date" }),
  endDate: z.coerce.date({ error: "Choose an end date" }),
  notes: optionalText(4000),
  travelers: z.coerce.number({ error: "Enter the number of travelers" }).int().min(1, "At least 1 traveler").max(50, "At most 50 travelers").optional().default(1),
  dailyBudget: z
    .union([z.literal(""), z.null(), z.coerce.number().int("Use a whole number").min(0, "Can't be negative").max(1_000_000)])
    .optional()
    .transform((value) => (value === "" || value === undefined ? null : value)),
};

function validDateRange(value, context) {
  if (!value.startDate || !value.endDate) return;

  if (value.endDate < value.startDate) {
    context.addIssue({ code: "custom", message: "End date must be on or after the start date", path: ["endDate"] });
    return;
  }

  const days = Math.round((value.endDate - value.startDate) / 86_400_000) + 1;

  if (days > MAX_TRIP_DAYS) {
    context.addIssue({ code: "custom", message: `Trips can be at most ${MAX_TRIP_DAYS} days`, path: ["endDate"] });
  }
}

export const createTripSchema = z
  .object({
    ...tripFields,
    suggestItinerary: z.boolean().optional().default(false),
  })
  .superRefine(validDateRange);

export const updateTripSchema = z
  .object({
    ...tripFields,
    status: z.enum(TRIP_STATUSES).optional(),
  })
  .superRefine(validDateRange);

export const tripItemSchema = z.object({
  day: z.coerce.number({ error: "Choose a day" }).int().min(1, "Choose a day").max(MAX_TRIP_DAYS),
  title: requiredText("Activity", 160),
  time: optionalText(40),
  notes: optionalText(1000),
  destinationId: z.union([idSchema, z.literal(""), z.null()]).optional().transform((value) => value || null),
  experienceId: z.union([idSchema, z.literal(""), z.null()]).optional().transform((value) => value || null),
});

export const tripItemMoveSchema = z.object({
  direction: z.enum(["up", "down"]),
});

export const tripItemParamSchema = z.object({ id: idSchema, itemId: idSchema });

/** Full itinerary order after a drag and drop: every item of the trip, grouped by day. */
export const tripReorderSchema = z.object({
  days: z
    .array(
      z.object({
        day: z.coerce.number().int().min(1).max(MAX_TRIP_DAYS),
        itemIds: z.array(idSchema).max(100),
      })
    )
    .min(1)
    .max(MAX_TRIP_DAYS),
});

export const checklistItemSchema = z.object({
  label: requiredText("Item", 120),
});

export const checklistUpdateSchema = z
  .object({
    label: requiredText("Item", 120).optional(),
    done: z.boolean().optional(),
  })
  .refine((value) => value.label !== undefined || value.done !== undefined, "Nothing to update");

export const checklistParamSchema = z.object({ id: idSchema, itemId: idSchema });
