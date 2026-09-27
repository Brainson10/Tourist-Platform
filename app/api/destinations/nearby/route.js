import { getQueryParams } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { getNearbyDestinations } from "@/lib/services/destination.service";
import { nearbyDestinationQuerySchema } from "@/lib/validators/destination";

export const GET = withErrorHandling(async (request) => {
  const query = validate(nearbyDestinationQuerySchema, getQueryParams(request));
  const destinations = await getNearbyDestinations(query);

  return successResponse(destinations, { message: "Nearby destinations loaded" });
});
