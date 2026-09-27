import { requireAuthenticatedUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { deleteTrip, getTrip, updateTrip } from "@/lib/services/trip.service";
import { idParamSchema } from "@/lib/validators/common";
import { updateTripSchema } from "@/lib/validators/trip";

export const GET = withErrorHandling(async (_request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id } = validate(idParamSchema, await params);

  return successResponse(await getTrip(id, user.id), { message: "Trip loaded" });
});

export const PATCH = withErrorHandling(async (request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id } = validate(idParamSchema, await params);
  const input = validate(updateTripSchema, await readJsonBody(request));

  return successResponse(await updateTrip(id, user.id, input), { message: "Trip updated" });
});

export const DELETE = withErrorHandling(async (_request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id } = validate(idParamSchema, await params);

  return successResponse(await deleteTrip(id, user.id), { message: "Trip deleted" });
});
