import { requireAuthenticatedUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { addChecklistItem } from "@/lib/services/trip.service";
import { idParamSchema } from "@/lib/validators/common";
import { checklistItemSchema } from "@/lib/validators/trip";

export const POST = withErrorHandling(async (request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id } = validate(idParamSchema, await params);
  const { label } = validate(checklistItemSchema, await readJsonBody(request));

  return successResponse(await addChecklistItem(id, user.id, label), { status: 201, message: "Added to your checklist" });
});
