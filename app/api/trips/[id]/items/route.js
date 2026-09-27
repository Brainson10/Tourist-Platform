import { requireAuthenticatedUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { addTripItem } from "@/lib/services/trip.service";
import { idParamSchema } from "@/lib/validators/common";
import { tripItemSchema } from "@/lib/validators/trip";

export const POST = withErrorHandling(async (request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id } = validate(idParamSchema, await params);
  const input = validate(tripItemSchema, await readJsonBody(request));

  return successResponse(await addTripItem(id, user.id, input), { status: 201, message: "Added to your itinerary" });
});
