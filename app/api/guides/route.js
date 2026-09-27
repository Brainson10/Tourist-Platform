import { getQueryParams } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { listGuides } from "@/lib/services/guide.service";
import { guideQuerySchema } from "@/lib/validators/guide";

export const GET = withErrorHandling(async (request) => {
  const query = validate(guideQuerySchema, getQueryParams(request));
  const { data, meta } = await listGuides(query);
  return successResponse(data, { message: "Guides loaded", meta });
});
