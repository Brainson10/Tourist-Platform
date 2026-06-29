import { requireAuthenticatedUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { handleApiError, successResponse } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { idParamSchema } from "@/lib/validators/common";
import { updateTripSchema } from "@/lib/validators/trip";
import { deleteTripForUser, getTripForUser, updateTripForUser } from "@/services/trip";

export async function GET(_request, { params }) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = validate(idParamSchema, await params);
    const trip = await getTripForUser(id, user.id);

    return successResponse(trip, {
      message: "Trip retrieved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = validate(idParamSchema, await params);
    const body = validate(updateTripSchema, await readJsonBody(request));
    const trip = await updateTripForUser(id, user.id, body);

    return successResponse(trip, {
      message: "Trip updated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = validate(idParamSchema, await params);
    const trip = await deleteTripForUser(id, user.id);

    return successResponse(trip, {
      message: "Trip deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
