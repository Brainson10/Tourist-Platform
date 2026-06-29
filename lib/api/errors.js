export class ApiError extends Error {
  constructor(message, status = 500, code = "INTERNAL_ERROR", details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message = "Bad request", details = null) {
  return new ApiError(message, 400, "BAD_REQUEST", details);
}

export function unauthorizedError(message = "Authentication required") {
  return new ApiError(message, 401, "UNAUTHORIZED");
}

export function forbiddenError(message = "You do not have permission to perform this action") {
  return new ApiError(message, 403, "FORBIDDEN");
}

export function notFoundError(message = "Resource not found") {
  return new ApiError(message, 404, "NOT_FOUND");
}

export function conflictError(message = "Resource conflict", details = null) {
  return new ApiError(message, 409, "CONFLICT", details);
}
