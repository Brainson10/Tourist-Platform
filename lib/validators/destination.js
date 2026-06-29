import { z } from "zod";
import { listQuerySchema, requireAtLeastOneField } from "@/lib/validators/common";

export const destinationSchema = z.object({
  name: z.string().trim().min(1, "Destination name is required"),
  slug: z.string().trim().min(1, "Destination slug is required"),
  description: z.string().trim().min(1, "Description is required"),
  state: z.string().trim().min(1, "State is required"),
  district: z.string().trim().min(1, "District is required"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  coverImage: z.string().url().optional().or(z.literal("")),
});

export const createDestinationSchema = destinationSchema;

export const updateDestinationSchema = requireAtLeastOneField(destinationSchema.partial());

export const destinationQuerySchema = listQuerySchema.extend({
  state: z.string().trim().min(1).optional(),
  district: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});
