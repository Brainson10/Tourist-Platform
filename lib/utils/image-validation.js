export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const SIGNATURES = [
  { type: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: "image/png", ext: "png", test: (b) => [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, i) => b[i] === byte) },
  { type: "image/webp", ext: "webp", test: (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP" },
  { type: "image/avif", ext: "avif", test: (b) => ascii(b, 4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(b, 8, 12)) },
];

function ascii(bytes, start, end) {
  return String.fromCharCode(...bytes.subarray(start, end));
}

/**
 * Identifies an image by its leading bytes ("magic numbers"), ignoring the filename and the
 * browser-supplied MIME type, which are both easy to fake. Returns { type, ext } or null.
 */
export function detectImageType(bytes) {
  if (!bytes || bytes.length < 12) return null;
  return SIGNATURES.find((signature) => signature.test(bytes)) ?? null;
}

/** Validates an uploaded image buffer. Returns { ok: true, type, ext } or { ok: false, status, message }. */
export function validateImageUpload(bytes) {
  if (!bytes?.length) return { ok: false, status: 400, message: "Choose an image to upload" };
  if (bytes.length > MAX_UPLOAD_BYTES) return { ok: false, status: 413, message: "Images must be 8 MB or smaller" };

  const detected = detectImageType(bytes);
  if (!detected) return { ok: false, status: 415, message: "Use a JPEG, PNG, WebP or AVIF image" };

  return { ok: true, ...detected };
}
