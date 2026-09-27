import { requireAuthenticatedUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { moveTripItem } from "@/lib/services/trip.service";
import { tripItemMoveSchema, tripItemParamSchema } from "@/lib/validators/trip";

export const POST = withErrorHandling(async (request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id, itemId } = validate(tripItemParamSchema, await params);
  const { direction } = validate(tripItemMoveSchema, await readJsonBody(request));

  return successResponse(await moveTripItem(id, itemId, user.id, direction), { message: "Itinerary reordered" });
});
