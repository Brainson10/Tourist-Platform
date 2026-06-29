import { requireAdminUser } from "@/lib/api/auth";
import { getQueryParams, readJsonBody } from "@/lib/api/request";
import { handleApiError, successResponse } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { createDestinationSchema, destinationQuerySchema } from "@/lib/validators/destination";
import { createDestination, listDestinations } from "@/services/destination";

export async function GET(request) {
  try {
    const query = validate(destinationQuerySchema, getQueryParams(request));
    const destinations = await listDestinations(query);

    return successResponse(destinations, {
      message: "Destinations retrieved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    await requireAdminUser();

    const body = validate(createDestinationSchema, await readJsonBody(request));
    const destination = await createDestination(body);

    return successResponse(destination, {
      status: 201,
      message: "Destination created successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
