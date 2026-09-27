import { requireAuthenticatedUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { deleteChecklistItem, updateChecklistItem } from "@/lib/services/trip.service";
import { checklistParamSchema, checklistUpdateSchema } from "@/lib/validators/trip";

export const PATCH = withErrorHandling(async (request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id, itemId } = validate(checklistParamSchema, await params);
  const input = validate(checklistUpdateSchema, await readJsonBody(request));

  return successResponse(await updateChecklistItem(id, itemId, user.id, input), { message: "Checklist updated" });
});

export const DELETE = withErrorHandling(async (_request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id, itemId } = validate(checklistParamSchema, await params);

  return successResponse(await deleteChecklistItem(id, itemId, user.id), { message: "Removed from your checklist" });
});
