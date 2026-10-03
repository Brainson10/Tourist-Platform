import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { getSouvenir } from "@/lib/services/souvenir.service";
import { slugParamSchema } from "@/lib/validators/souvenir";

export const GET = withErrorHandling(async (_request, { params }) => {
  const { slug } = validate(slugParamSchema, await params);

  return successResponse(await getSouvenir(slug), { message: "Souvenir loaded" });
});
