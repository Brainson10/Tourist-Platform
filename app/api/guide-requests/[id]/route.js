import { requireAuthenticatedUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { updateGuideRequest } from "@/lib/services/guide.service";
import { idParamSchema } from "@/lib/validators/common";
import { guideRequestUpdateSchema } from "@/lib/validators/guide";

const MESSAGES = { ACCEPTED: "Request accepted — you can now see each other's contact details", DECLINED: "Request declined", CANCELLED: "Request cancelled" };

export const PATCH = withErrorHandling(async (request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id } = validate(idParamSchema, await params);
  const { status } = validate(guideRequestUpdateSchema, await readJsonBody(request));

  return successResponse(await updateGuideRequest(user, id, status), { message: MESSAGES[status] });
});
