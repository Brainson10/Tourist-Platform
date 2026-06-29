import { badRequest } from "@/lib/api/errors";

export async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw badRequest("Request body must be valid JSON");
  }
}

export function getQueryParams(request) {
  return Object.fromEntries(request.nextUrl.searchParams.entries());
}
