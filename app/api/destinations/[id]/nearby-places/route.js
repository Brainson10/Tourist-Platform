import { getQueryParams } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { findNearbyPlacesForDestination } from "@/lib/services/nearby-places.service";
import { idParamSchema } from "@/lib/validators/common";
import { nearbyPlacesQuerySchema } from "@/lib/validators/destination";

export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = validate(idParamSchema, await params);
  const query = validate(nearbyPlacesQuerySchema, getQueryParams(request));
  const result = await findNearbyPlacesForDestination(id, query);

  return successResponse(result, { message: result.available ? "Nearby places loaded" : "Nearby places are unavailable right now" });
});
