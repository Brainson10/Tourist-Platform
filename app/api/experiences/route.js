import { requireAuthenticatedUser } from "@/lib/api/auth";
import { getQueryParams, readJsonBody } from "@/lib/api/request";
import { handleApiError, successResponse } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { createExperienceSchema, experienceQuerySchema } from "@/lib/validators/experience";
import { createExperience, listExperiences } from "@/services/experience";

export async function GET(request) {
  try {
    const query = validate(experienceQuerySchema, getQueryParams(request));
    const experiences = await listExperiences(query);

    return successResponse(experiences, {
      message: "Experiences retrieved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    await requireAuthenticatedUser();

    const body = validate(createExperienceSchema, await readJsonBody(request));
    const experience = await createExperience(body);

    return successResponse(experience, {
      status: 201,
      message: "Experience created successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
