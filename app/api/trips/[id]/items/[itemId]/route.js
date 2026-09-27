import { requireAuthenticatedUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { deleteTripItem, updateTripItem } from "@/lib/services/trip.service";
import { tripItemParamSchema, tripItemSchema } from "@/lib/validators/trip";

export const PATCH = withErrorHandling(async (request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id, itemId } = validate(tripItemParamSchema, await params);
  const input = validate(tripItemSchema, await readJsonBody(request));

  return successResponse(await updateTripItem(id, itemId, user.id, input), { message: "Itinerary updated" });
});

export const DELETE = withErrorHandling(async (_request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id, itemId } = validate(tripItemParamSchema, await params);

  return successResponse(await deleteTripItem(id, itemId, user.id), { message: "Removed from your itinerary" });
});
