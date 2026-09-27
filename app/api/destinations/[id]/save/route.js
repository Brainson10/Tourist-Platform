import { requireAuthenticatedUser } from "@/lib/api/auth";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { setSaved } from "@/lib/services/saved.service";
import { idParamSchema } from "@/lib/validators/common";

export const PUT = withErrorHandling(async (_request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id } = validate(idParamSchema, await params);

  return successResponse(await setSaved(user.id, id, true), { message: "Saved to your places" });
});

export const DELETE = withErrorHandling(async (_request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id } = validate(idParamSchema, await params);

  return successResponse(await setSaved(user.id, id, false), { message: "Removed from your places" });
});
