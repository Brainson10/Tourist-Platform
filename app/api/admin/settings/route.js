import { requireAdminUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { getSettings, saveSettings } from "@/lib/services/settings.service";
import { settingsSchema } from "@/lib/validators/admin";

export const GET = withErrorHandling(async () => {
  await requireAdminUser();

  return successResponse(await getSettings(), { message: "Loaded" });
});

export const PUT = withErrorHandling(async (request) => {
  await requireAdminUser();
  const input = validate(settingsSchema, await readJsonBody(request));

  return successResponse(await saveSettings(input), { message: "Settings saved" });
});
