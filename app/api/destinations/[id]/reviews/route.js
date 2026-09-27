import { requireAuthenticatedUser } from "@/lib/api/auth";
import { getQueryParams, readJsonBody } from "@/lib/api/request";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { validate } from "@/lib/api/validation";
import { getCurrentUser } from "@/lib/auth/session";
import { deleteOwnReview, getReviewSection, submitReview } from "@/lib/services/review.service";
import { idParamSchema } from "@/lib/validators/common";
import { reviewQuerySchema, reviewSchema } from "@/lib/validators/review";

export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = validate(idParamSchema, await params);
  const query = validate(reviewQuerySchema, getQueryParams(request));
  const user = await getCurrentUser();
  const section = await getReviewSection(id, user?.id, query);

  return successResponse(section, { message: "Reviews loaded" });
});

export const POST = withErrorHandling(async (request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id } = validate(idParamSchema, await params);
  const input = validate(reviewSchema, await readJsonBody(request));
  const review = await submitReview({ destinationId: id, user, input });

  return successResponse(review, {
    status: 201,
    message: review.status === "APPROVED" ? "Thanks! Your review is live." : "Thanks! Your review will appear once it's approved.",
  });
});

export const DELETE = withErrorHandling(async (_request, { params }) => {
  const user = await requireAuthenticatedUser();
  const { id } = validate(idParamSchema, await params);
  const result = await deleteOwnReview({ destinationId: id, user });

  return successResponse(result, { message: "Your review was removed" });
});
