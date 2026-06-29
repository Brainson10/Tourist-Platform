import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/helpers";

const publicRoutes = ["/", "/login", "/signup", "/about", "/contact"];
const publicReadApiPrefixes = ["/api/destinations", "/api/experiences", "/api/festivals", "/api/stories"];

function jsonUnauthorized() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    },
    { status: 401 }
  );
}

function isPublicApiRequest(pathname, method) {
  if (pathname.startsWith("/api/auth")) {
    return true;
  }

  return method === "GET" && publicReadApiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function authMiddleware(request) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api") && isPublicApiRequest(pathname, request.method)) {
    return NextResponse.next();
  }

  const session = await getServerSession(request.headers);
  const user = session?.user;

  if (!user) {
    if (pathname.startsWith("/api")) {
      return jsonUnauthorized();
    }

    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  if (pathname.startsWith("/government") && user.role !== "GOVERNMENT") {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  if (pathname.startsWith("/dashboard") && !["TOURIST", "ADMIN", "GUIDE", "GOVERNMENT"].includes(user.role)) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return NextResponse.next();
}
