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

export function errorResponse(message = "Something went wrong. Please try again.", { status = 500, code = "INTERNAL_ERROR", details = null } = {}) {
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

/** Maps known errors to safe JSON responses. Never leaks database internals. */
export function handleApiError(error) {
  if (error instanceof ApiError) {
    return errorResponse(error.message, {
      status: error.status,
      code: error.code,
      details: error.details,
    });
  }

  if (error?.code === "P2002") {
    const fields = [error.meta?.target].flat().filter(Boolean).join(", ");
    return errorResponse(fields ? `That ${fields} is already in use` : "That value is already in use", {
      status: 409,
      code: "CONFLICT",
    });
  }

  if (error?.code === "P2003" || error?.code === "P2014") {
    return errorResponse("This item is linked to other content. Remove those links first.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  if (error?.code === "P2025") {
    return errorResponse("We couldn't find that item", { status: 404, code: "NOT_FOUND" });
  }

  console.error("[api] Unhandled error", error);

  return errorResponse();
}

/** Wraps a route handler with consistent error handling. */
export function withErrorHandling(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
