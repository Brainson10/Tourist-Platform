import { getQueryParams } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { listStories } from "@/lib/services/story.service";
import { storyQuerySchema } from "@/lib/validators/content";

export const GET = withErrorHandling(async (request) => {
  const query = validate(storyQuerySchema, getQueryParams(request));
  const { data, meta } = await listStories(query);

  return successResponse(data, { message: "Stories loaded", meta });
});
