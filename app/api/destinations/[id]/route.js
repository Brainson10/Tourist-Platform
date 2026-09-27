import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { getDestinationBySlugOrId } from "@/lib/services/destination.service";
import { idParamSchema } from "@/lib/validators/common";

export const GET = withErrorHandling(async (_request, { params }) => {
  const { id } = validate(idParamSchema, await params);
  const destination = await getDestinationBySlugOrId(id);

  return successResponse(destination, { message: "Destination loaded" });
});
