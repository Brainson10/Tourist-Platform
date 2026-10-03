import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ApiError } from "@/lib/api/errors";

export const UPLOAD_FOLDERS = ["destinations", "experiences", "festivals", "stories", "souvenirs", "reviews", "guides", "avatars"];

function cloudinaryConfig() {
  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
  return cloud && key && secret ? { cloud, key, secret } : null;
}

/** "cloudinary" when configured; "local" only outside production; otherwise null (uploads disabled). */
export function storageMode() {
  if (cloudinaryConfig()) return "cloudinary";
  return process.env.NODE_ENV === "production" ? null : "local";
}

/** Signed upload over Cloudinary's REST API — the secret never leaves the server. */
async function uploadToCloudinary(bytes, { folder, type }, config) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder: `smart-tourism/${folder}`, timestamp };
  const toSign = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join("&");
  const signature = createHash("sha1").update(toSign + config.secret).digest("hex");

  const form = new FormData();
  form.append("file", new Blob([bytes], { type }));
  form.append("api_key", config.key);
  form.append("timestamp", String(timestamp));
  form.append("folder", params.folder);
  form.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloud}/image/upload`, { method: "POST", body: form, signal: AbortSignal.timeout(30_000) });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.secure_url) {
    console.error("[storage] Cloudinary upload failed", response.status, payload?.error?.message);
    throw new ApiError("The image couldn't be uploaded. Please try again.", 502, "UPLOAD_FAILED");
  }

  return payload.secure_url;
}

/** Development only: writes into public/uploads with a random name (never the user's filename). */
async function saveLocally(bytes, { folder, ext }) {
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  const directory = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), bytes);
  return `/uploads/${folder}/${name}`;
}

export async function storeImage(bytes, { folder, type, ext }) {
  if (!UPLOAD_FOLDERS.includes(folder)) throw new ApiError("Unknown upload folder", 400, "BAD_REQUEST");

  const mode = storageMode();
  if (mode === "cloudinary") return uploadToCloudinary(bytes, { folder, type }, cloudinaryConfig());
  if (mode === "local") return saveLocally(bytes, { folder, ext });

  throw new ApiError("Photo uploads aren't set up on this server yet. Paste an image link instead.", 503, "UPLOADS_UNAVAILABLE");
}
