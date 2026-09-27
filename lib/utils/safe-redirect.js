/** Only allow same-site relative paths, e.g. "/trips/abc". Blocks "//evil.com" and absolute URLs. */
export function safeRedirectPath(value, fallback = "/dashboard") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }

  return value;
}
