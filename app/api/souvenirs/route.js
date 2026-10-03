import { getQueryParams } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { listSouvenirs } from "@/lib/services/souvenir.service";
import { souvenirQuerySchema } from "@/lib/validators/souvenir";

export const GET = withErrorHandling(async (request) => {
  const query = validate(souvenirQuerySchema, getQueryParams(request));
  const { data, meta } = await listSouvenirs(query);

  return successResponse(data, { message: "Souvenirs loaded", meta });
});
