import { requireAuthenticatedUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { handleApiError, successResponse } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { idParamSchema } from "@/lib/validators/common";
import { updateExperienceSchema } from "@/lib/validators/experience";
import { deleteExperience, getExperienceById, updateExperience } from "@/services/experience";

export async function GET(_request, { params }) {
  try {
    const { id } = validate(idParamSchema, await params);
    const experience = await getExperienceById(id);

    return successResponse(experience, {
      message: "Experience retrieved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireAuthenticatedUser();

    const { id } = validate(idParamSchema, await params);
    const body = validate(updateExperienceSchema, await readJsonBody(request));
    const experience = await updateExperience(id, body);

    return successResponse(experience, {
      message: "Experience updated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    await requireAuthenticatedUser();

    const { id } = validate(idParamSchema, await params);
    const experience = await deleteExperience(id);

    return successResponse(experience, {
      message: "Experience deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
