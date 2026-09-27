export class ApiError extends Error {
  constructor(message, status = 500, code = "INTERNAL_ERROR", details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message = "That request isn't valid", details = null) {
  return new ApiError(message, 400, "BAD_REQUEST", details);
}

export function unauthorizedError(message = "Please sign in to continue") {
  return new ApiError(message, 401, "UNAUTHORIZED");
}

export function forbiddenError(message = "You don't have permission to do that") {
  return new ApiError(message, 403, "FORBIDDEN");
}

export function notFoundError(message = "We couldn't find that") {
  return new ApiError(message, 404, "NOT_FOUND");
}

export function conflictError(message = "That conflicts with existing content", details = null) {
  return new ApiError(message, 409, "CONFLICT", details);
}

export function isNotFound(error) {
  return error instanceof ApiError && error.status === 404;
}
