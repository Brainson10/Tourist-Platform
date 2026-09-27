import { ApiError, forbiddenError } from "@/lib/api/errors";
import { storeImage } from "@/lib/storage";
import { validateImageUpload } from "@/lib/utils/image-validation";

// Content folders are for admins; travelers can upload review photos, their avatar and a guide photo.
const ADMIN_ONLY = new Set(["destinations", "experiences", "festivals", "stories"]);
const HOURLY_LIMIT = 40;
const recentUploads = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const timestamps = (recentUploads.get(userId) ?? []).filter((time) => now - time < 3_600_000);
  if (timestamps.length >= HOURLY_LIMIT) throw new ApiError("You've uploaded a lot of photos in the last hour. Please try again later.", 429, "RATE_LIMITED");
  timestamps.push(now);
  recentUploads.set(userId, timestamps);
}

export async function uploadImage({ user, folder, file }) {
  if (ADMIN_ONLY.has(folder) && user.role !== "ADMIN") throw forbiddenError("Only admins can upload photos here");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const check = validateImageUpload(bytes);
  if (!check.ok) throw new ApiError(check.message, check.status, check.status === 413 ? "TOO_LARGE" : "UNSUPPORTED_MEDIA_TYPE");

  checkRateLimit(user.id);
  const url = await storeImage(bytes, { folder, type: check.type, ext: check.ext });
  return { url };
}
