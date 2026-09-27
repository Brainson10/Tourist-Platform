import { z } from "zod";
import { ApiError } from "@/lib/api/errors";

export function validate(schema, payload) {
  const result = schema.safeParse(payload);

  if (!result.success) {
    const { formErrors, fieldErrors } = z.flattenError(result.error);

    throw new ApiError(formErrors[0] ?? "Please check the highlighted fields", 422, "VALIDATION_ERROR", {
      fieldErrors,
      formErrors,
    });
  }

  return result.data;
}
