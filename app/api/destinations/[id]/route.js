import { requireAdminUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { handleApiError, successResponse } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { idParamSchema } from "@/lib/validators/common";
import { updateDestinationSchema } from "@/lib/validators/destination";
import { deleteDestination, getDestinationById, updateDestination } from "@/services/destination";

export async function GET(_request, { params }) {
  try {
    const { id } = validate(idParamSchema, await params);
    const destination = await getDestinationById(id);

    return successResponse(destination, {
      message: "Destination retrieved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireAdminUser();

    const { id } = validate(idParamSchema, await params);
    const body = validate(updateDestinationSchema, await readJsonBody(request));
    const destination = await updateDestination(id, body);

    return successResponse(destination, {
      message: "Destination updated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    await requireAdminUser();

    const { id } = validate(idParamSchema, await params);
    const destination = await deleteDestination(id);

    return successResponse(destination, {
      message: "Destination deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
