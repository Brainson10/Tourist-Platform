import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/api/auth";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { disableSharing, enableSharing } from "@/lib/services/trip.service";
import { idParamSchema } from "@/lib/validators/common";

const shareSchema = z.object({ regenerate: z.boolean().optional().default(false) });

export const POST = withErrorHandling(async (request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id } = validate(idParamSchema, await params);
  const body = await request.json().catch(() => ({}));
  const { regenerate } = validate(shareSchema, body ?? {});

  return successResponse(await enableSharing(id, user.id, { regenerate }), { message: regenerate ? "New share link created — the old one no longer works" : "Share link ready" });
});

export const DELETE = withErrorHandling(async (_request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id } = validate(idParamSchema, await params);

  return successResponse(await disableSharing(id, user.id), { message: "Sharing turned off" });
});
