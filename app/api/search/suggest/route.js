import { z } from "zod";
import { getQueryParams } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { suggest } from "@/lib/services/search.service";

const suggestQuerySchema = z.object({ q: z.string().trim().min(2, "Type at least 2 characters").max(60) });

export const GET = withErrorHandling(async (request) => {
  const { q } = validate(suggestQuerySchema, getQueryParams(request));
  return successResponse(await suggest(q), { message: "Suggestions loaded" });
});
