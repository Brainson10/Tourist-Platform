import { requireAuthenticatedUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { createGuideRequest } from "@/lib/services/guide.service";
import { idParamSchema } from "@/lib/validators/common";
import { guideRequestSchema } from "@/lib/validators/guide";

export const POST = withErrorHandling(async (request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id } = validate(idParamSchema, await params);
  const input = validate(guideRequestSchema, await readJsonBody(request));

  return successResponse(await createGuideRequest(user, id, input), { status: 201, message: "Request sent. The guide will reply here." });
});
