import { requireAdminUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { handleApiError, successResponse } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { idParamSchema } from "@/lib/validators/common";
import { updateFestivalSchema } from "@/lib/validators/festival";
import { deleteFestival, getFestivalById, updateFestival } from "@/services/festival";

export async function GET(_request, { params }) {
  try {
    const { id } = validate(idParamSchema, await params);
    const festival = await getFestivalById(id);

    return successResponse(festival, {
      message: "Festival retrieved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireAdminUser();

    const { id } = validate(idParamSchema, await params);
    const body = validate(updateFestivalSchema, await readJsonBody(request));
    const festival = await updateFestival(id, body);

    return successResponse(festival, {
      message: "Festival updated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    await requireAdminUser();

    const { id } = validate(idParamSchema, await params);
    const festival = await deleteFestival(id);

    return successResponse(festival, {
      message: "Festival deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
