import { getQueryParams } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { listFestivals } from "@/lib/services/festival.service";
import { festivalQuerySchema } from "@/lib/validators/content";

export const GET = withErrorHandling(async (request) => {
  const query = validate(festivalQuerySchema, getQueryParams(request));
  const { data, meta } = await listFestivals(query);

  return successResponse(data, { message: "Festivals loaded", meta });
});
