import { requireAuthenticatedUser } from "@/lib/api/auth";
import { getQueryParams, readJsonBody } from "@/lib/api/request";
import { handleApiError, successResponse } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { createTripSchema, tripQuerySchema } from "@/lib/validators/trip";
import { createTripForUser, listTripsForUser } from "@/services/trip";

export async function GET(request) {
  try {
    const user = await requireAuthenticatedUser();
    const query = validate(tripQuerySchema, getQueryParams(request));
    const trips = await listTripsForUser(user.id, query);

    return successResponse(trips, {
      message: "Trips retrieved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = validate(createTripSchema, await readJsonBody(request));
    const trip = await createTripForUser(user.id, body);

    return successResponse(trip, {
      status: 201,
      message: "Trip created successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
