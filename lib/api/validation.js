import { ApiError } from "@/lib/api/errors";

export function validate(schema, payload) {
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw new ApiError("Validation failed", 422, "VALIDATION_ERROR", result.error.flatten().fieldErrors);
  }

  return result.data;
}
