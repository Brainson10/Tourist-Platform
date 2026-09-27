import { NextResponse } from "next/server";
import { pickSurprise } from "@/lib/services/search.service";

export const dynamic = "force-dynamic";

// "Surprise me": redirect to a random destination (never cached, so every click differs).
export async function GET(request) {
  const slug = await pickSurprise().catch(() => null);
  const response = NextResponse.redirect(new URL(slug ? `/destinations/${slug}` : "/destinations", request.url), 307);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
