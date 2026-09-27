import { requireAuthenticatedUser } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { UPLOAD_FOLDERS } from "@/lib/storage";
import { uploadImage } from "@/lib/services/upload.service";
import { MAX_UPLOAD_BYTES } from "@/lib/utils/image-validation";

// multipart/form-data with `file` and `folder`. Responds with { url }.
export const POST = withErrorHandling(async (request) => {
  const user = await requireAuthenticatedUser();

  // Reject oversized bodies before reading them (small allowance for multipart overhead).
  if (Number(request.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES + 64 * 1024) {
    return Response.json({ success: false, error: { code: "TOO_LARGE", message: "Images must be 8 MB or smaller" } }, { status: 413 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const folder = String(form?.get("folder") ?? "");

  if (!UPLOAD_FOLDERS.includes(folder)) throw badRequest("Choose where the photo is for");
  if (!file || typeof file === "string") throw badRequest("Choose an image to upload");

  return successResponse(await uploadImage({ user, folder, file }), { status: 201, message: "Photo uploaded" });
});
