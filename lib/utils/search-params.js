/** Flattens Next.js searchParams (string | string[]) and validates them without ever throwing. */
export function parseSearchParams(schema, searchParams = {}) {
  const flat = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]).filter(([, value]) => value !== "")
  );
  const result = schema.safeParse(flat);

  if (result.success) return result.data;

  // Drop only the invalid keys and keep the rest.
  const invalid = new Set(result.error.issues.map((issue) => issue.path[0]));
  const cleaned = Object.fromEntries(Object.entries(flat).filter(([key]) => !invalid.has(key)));
  const retry = schema.safeParse(cleaned);
  return retry.success ? retry.data : {};
}
