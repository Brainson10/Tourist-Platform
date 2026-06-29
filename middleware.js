import { authMiddleware } from "@/lib/auth/middleware";

export async function middleware(request) {
  return authMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
