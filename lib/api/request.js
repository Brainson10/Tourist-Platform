import { badRequest } from "@/lib/api/errors";

export async function readJsonBody(request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("not an object");
    }

    return body;
  } catch {
    throw badRequest("Request body must be a JSON object");
  }
}

export function getQueryParams(request) {
  return Object.fromEntries(request.nextUrl.searchParams.entries());
}
