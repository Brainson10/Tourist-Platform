import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { getStoryBySlug } from "@/lib/services/story.service";
import { idParamSchema } from "@/lib/validators/common";

// [id] is the story's URL slug.
export const GET = withErrorHandling(async (_request, { params }) => {
  const { id } = validate(idParamSchema, await params);

  return successResponse(await getStoryBySlug(id), { message: "Story loaded" });
});
