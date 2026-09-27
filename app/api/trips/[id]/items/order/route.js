import { requireAuthenticatedUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { reorderTripItems } from "@/lib/services/trip.service";
import { idParamSchema } from "@/lib/validators/common";
import { tripReorderSchema } from "@/lib/validators/trip";

export const PUT = withErrorHandling(async (request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id } = validate(idParamSchema, await params);
  const { days } = validate(tripReorderSchema, await readJsonBody(request));

  return successResponse(await reorderTripItems(id, user.id, days), { message: "Itinerary saved" });
});
