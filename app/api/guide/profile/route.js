import { requireAuthenticatedUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { getMyGuideProfile, saveGuideProfile } from "@/lib/services/guide.service";
import { guideProfileSchema } from "@/lib/validators/guide";

export const GET = withErrorHandling(async () => {
  const user = await requireAuthenticatedUser();
  return successResponse(await getMyGuideProfile(user), { message: "Profile loaded" });
});

export const PUT = withErrorHandling(async (request) => {
  const user = await requireAuthenticatedUser();
  const input = validate(guideProfileSchema, await readJsonBody(request));
  const profile = await saveGuideProfile(user, input);

  return successResponse(profile, { message: profile.status === "APPROVED" ? "Profile updated" : "Application sent — we'll review it soon" });
});
