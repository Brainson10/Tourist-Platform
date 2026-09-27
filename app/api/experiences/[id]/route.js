import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { getExperience } from "@/lib/services/experience.service";
import { idParamSchema } from "@/lib/validators/common";

export const GET = withErrorHandling(async (_request, { params }) => {
  const { id } = validate(idParamSchema, await params);

  return successResponse(await getExperience(id), { message: "Experience loaded" });
});
