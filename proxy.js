import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic check only: real authentication and role checks happen on the
// server in layouts, pages and API routes. This just avoids rendering
// protected pages for visitors that clearly have no session cookie.
const PROTECTED_PREFIXES = ["/dashboard", "/trips", "/saved", "/profile", "/admin", "/guide"];

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  if (!PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }

  if (getSessionCookie(request)) {
    // Let server layouts build an accurate "return to" link if the session turns out to be invalid.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", `${pathname}${search}`);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/trips/:path*", "/saved/:path*", "/profile/:path*", "/admin/:path*", "/guide", "/guide/:path*"],
};
