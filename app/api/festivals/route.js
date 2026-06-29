import { requireAdminUser } from "@/lib/api/auth";
import { getQueryParams, readJsonBody } from "@/lib/api/request";
import { handleApiError, successResponse } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { createFestivalSchema, festivalQuerySchema } from "@/lib/validators/festival";
import { createFestival, listFestivals } from "@/services/festival";

export async function GET(request) {
  try {
    const query = validate(festivalQuerySchema, getQueryParams(request));
    const festivals = await listFestivals(query);

    return successResponse(festivals, {
      message: "Festivals retrieved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    await requireAdminUser();

    const body = validate(createFestivalSchema, await readJsonBody(request));
    const festival = await createFestival(body);

    return successResponse(festival, {
      status: 201,
      message: "Festival created successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
