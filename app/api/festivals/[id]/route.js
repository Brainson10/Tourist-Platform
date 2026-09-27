import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { getFestivalBySlug } from "@/lib/services/festival.service";
import { idParamSchema } from "@/lib/validators/common";

// [id] is the festival's URL slug.
export const GET = withErrorHandling(async (_request, { params }) => {
  const { id } = validate(idParamSchema, await params);

  return successResponse(await getFestivalBySlug(id), { message: "Festival loaded" });
});
