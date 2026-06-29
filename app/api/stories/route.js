import { requireAdminUser } from "@/lib/api/auth";
import { getQueryParams, readJsonBody } from "@/lib/api/request";
import { handleApiError, successResponse } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { createStorySchema, storyQuerySchema } from "@/lib/validators/story";
import { createStory, listStories } from "@/services/story";

export async function GET(request) {
  try {
    const query = validate(storyQuerySchema, getQueryParams(request));
    const stories = await listStories(query);

    return successResponse(stories, {
      message: "Stories retrieved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    await requireAdminUser();

    const body = validate(createStorySchema, await readJsonBody(request));
    const story = await createStory(body);

    return successResponse(story, {
      status: 201,
      message: "Story created successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
