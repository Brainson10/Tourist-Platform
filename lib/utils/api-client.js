/**
 * Small fetch wrapper for client components. Always resolves to
 * { ok, data, message, fieldErrors } so callers never deal with thrown errors.
 */
export async function apiRequest(url, { method = "GET", body } = {}) {
  try {
    const response = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      return {
        ok: false,
        status: response.status,
        message:
          payload?.error?.message ??
          (response.status === 401 ? "Please sign in to continue." : "Something went wrong. Please try again."),
        fieldErrors: payload?.error?.details?.fieldErrors ?? {},
      };
    }

    return { ok: true, status: response.status, data: payload.data, meta: payload.meta, message: payload.message, fieldErrors: {} };
  } catch {
    return { ok: false, status: 0, message: "You appear to be offline. Check your connection and try again.", fieldErrors: {} };
  }
}

/** Uploads one image file. Resolves to { ok, url } or { ok: false, message }. */
export async function uploadImageFile(file, folder) {
  if (file.size > 8 * 1024 * 1024) return { ok: false, message: `“${file.name}” is larger than 8 MB.` };

  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  try {
    const response = await fetch("/api/uploads", { method: "POST", body: form });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success) {
      return { ok: false, message: payload?.error?.message ?? (response.status === 413 ? "That image is too large." : "The upload failed. Please try again.") };
    }
    return { ok: true, url: payload.data.url };
  } catch {
    return { ok: false, message: "You appear to be offline. Check your connection and try again." };
  }
}
