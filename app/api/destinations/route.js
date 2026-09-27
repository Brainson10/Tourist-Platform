import { getQueryParams } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { listDestinations } from "@/lib/services/destination.service";
import { destinationQuerySchema } from "@/lib/validators/destination";

export const GET = withErrorHandling(async (request) => {
  const query = validate(destinationQuerySchema, getQueryParams(request));
  const { data, meta } = await listDestinations(query);

  return successResponse(data, { message: "Destinations loaded", meta });
});
