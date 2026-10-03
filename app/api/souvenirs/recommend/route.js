import { getQueryParams } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { recommendSouvenirs } from "@/lib/services/souvenir.service";
import { souvenirRecommendSchema } from "@/lib/validators/souvenir";

export const GET = withErrorHandling(async (request) => {
  const query = validate(souvenirRecommendSchema, getQueryParams(request));

  return successResponse(await recommendSouvenirs(query), { message: "Ideas ready" });
});
