import { requireAuthenticatedUser } from "@/lib/api/auth";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { addSuggestedChecklist } from "@/lib/services/trip.service";
import { idParamSchema } from "@/lib/validators/common";

export const POST = withErrorHandling(async (_request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id } = validate(idParamSchema, await params);
  const result = await addSuggestedChecklist(id, user.id);

  return successResponse(result, { message: result.added ? `Added ${result.added} suggestions` : "Your list already has everything we'd suggest" });
});
