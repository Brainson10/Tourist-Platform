import { getQueryParams } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { listDestinationPoints } from "@/lib/services/destination.service";
import { destinationQuerySchema } from "@/lib/validators/destination";

// Lightweight points for map views. Same filters as /api/destinations, not paginated (max 500).
export const GET = withErrorHandling(async (request) => {
  const query = validate(destinationQuerySchema, getQueryParams(request));
  const points = await listDestinationPoints(query);

  return successResponse(
    points.map(({ id, name, slug, latitude, longitude, image, village, ratingAverage, reviewCount }) => ({ id, name, slug, latitude, longitude, image, village, ratingAverage, reviewCount })),
    { message: "Map points loaded" }
  );
});
