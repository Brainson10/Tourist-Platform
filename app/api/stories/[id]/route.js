import { requireAdminUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { handleApiError, successResponse } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { idParamSchema } from "@/lib/validators/common";
import { updateStorySchema } from "@/lib/validators/story";
import { deleteStory, getStoryById, updateStory } from "@/services/story";

export async function GET(_request, { params }) {
  try {
    const { id } = validate(idParamSchema, await params);
    const story = await getStoryById(id);

    return successResponse(story, {
      message: "Story retrieved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireAdminUser();

    const { id } = validate(idParamSchema, await params);
    const body = validate(updateStorySchema, await readJsonBody(request));
    const story = await updateStory(id, body);

    return successResponse(story, {
      message: "Story updated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    await requireAdminUser();

    const { id } = validate(idParamSchema, await params);
    const story = await deleteStory(id);

    return successResponse(story, {
      message: "Story deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
