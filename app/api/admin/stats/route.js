import { requireAdminUser } from "@/lib/api/auth";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getAdminOverview } from "@/lib/services/admin.service";

export const GET = withErrorHandling(async () => {
  await requireAdminUser();

  return successResponse(await getAdminOverview(), { message: "Loaded" });
});
