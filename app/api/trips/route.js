import { requireAuthenticatedUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { createTrip, listTrips } from "@/lib/services/trip.service";
import { createTripSchema } from "@/lib/validators/trip";

export const GET = withErrorHandling(async () => {
  const user = await requireAuthenticatedUser();

  return successResponse(await listTrips(user.id), { message: "Trips loaded" });
});

export const POST = withErrorHandling(async (request) => {
  const user = await requireAuthenticatedUser();
  const input = validate(createTripSchema, await readJsonBody(request));

  return successResponse(await createTrip(user.id, input), { status: 201, message: "Trip created" });
});
