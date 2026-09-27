import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/utils/safe-redirect";

export const dynamic = "force-dynamic";

// Server-side guard for every tourist account page (proxy.js is only an optimistic check).
export default async function AccountLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    const path = safeRedirectPath((await headers()).get("x-pathname"), "/dashboard");
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  return children;
}
