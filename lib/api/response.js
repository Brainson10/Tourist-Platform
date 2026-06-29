import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/errors";

export function successResponse(data = null, { status = 200, message = "Success", meta = null } = {}) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

export function errorResponse(message = "Something went wrong", { status = 500, code = "INTERNAL_ERROR", details = null } = {}) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}

export function validationError(details, message = "Validation failed") {
  return errorResponse(message, {
    status: 422,
    code: "VALIDATION_ERROR",
    details,
  });
}

export function unauthorized(message = "Authentication required") {
  return errorResponse(message, { status: 401, code: "UNAUTHORIZED" });
}

export function forbidden(message = "You do not have permission to perform this action") {
  return errorResponse(message, { status: 403, code: "FORBIDDEN" });
}

export function notFound(message = "Resource not found") {
  return errorResponse(message, { status: 404, code: "NOT_FOUND" });
}

export function handleApiError(error) {
  if (error instanceof ApiError) {
    return errorResponse(error.message, {
      status: error.status,
      code: error.code,
      details: error.details,
    });
  }

  if (error?.code === "P2002") {
    return errorResponse("A record with this unique value already exists", {
      status: 409,
      code: "CONFLICT",
      details: error.meta ?? null,
    });
  }

  if (error?.code === "P2025") {
    return notFound();
  }

  console.error(error);

  return errorResponse();
}
