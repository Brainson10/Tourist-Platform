import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { getGuide } from "@/lib/services/guide.service";
import { idParamSchema } from "@/lib/validators/common";

export const GET = withErrorHandling(async (_request, { params }) => {
  const { id } = validate(idParamSchema, await params);
  const { userId: _userId, ...guide } = await getGuide(id);
  return successResponse(guide, { message: "Guide loaded" });
});
