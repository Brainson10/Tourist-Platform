import { getQueryParams } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { listExperiences } from "@/lib/services/experience.service";
import { experienceQuerySchema } from "@/lib/validators/content";

export const GET = withErrorHandling(async (request) => {
  const query = validate(experienceQuerySchema, getQueryParams(request));
  const { data, meta } = await listExperiences(query);

  return successResponse(data, { message: "Experiences loaded", meta });
});
