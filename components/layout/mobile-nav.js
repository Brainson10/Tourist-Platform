"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/actions/auth/logout";
import { ACCOUNT_NAV, MAIN_NAV } from "@/components/layout/nav-config";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function MobileNav({ user }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkClass = "block rounded-lg px-3 py-2.5 text-base font-medium text-ink hover:bg-surface-muted";

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-surface-muted"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open ? (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[71px] z-40 overflow-y-auto border-t border-line bg-surface px-4 py-4">
          <nav aria-label="Mobile" className="space-y-1">
            {MAIN_NAV.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
            <Link href="/trips/new" className={linkClass}>
              Plan a trip
            </Link>
          </nav>
          <div className="mt-4 flex items-center justify-between border-t border-line px-3 pt-4">
            <span className="text-sm text-ink-muted">Theme</span>
            <ThemeToggle />
          </div>
          <div className="mt-4 border-t border-line pt-4">
            {user ? (
              <div className="space-y-1">
                <p className="px-3 pb-2 text-sm text-ink-muted">Signed in as {user.fullName}</p>
                {ACCOUNT_NAV.map((link) => (
                  <Link key={link.href} href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                ))}
                <Link href={user.role === "GUIDE" ? "/guide" : "/guide/apply"} className={linkClass}>
                  {user.role === "GUIDE" ? "Guide dashboard" : "Become a guide"}
                </Link>
                {user.role === "ADMIN" ? (
                  <Link href="/admin" className={linkClass}>
                    Admin panel
                  </Link>
                ) : null}
                <form action={logoutAction}>
                  <button type="submit" className="block w-full rounded-lg px-3 py-2.5 text-left text-base font-medium text-danger-ink hover:bg-danger-soft">
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login" className="rounded-lg border border-line-strong px-4 py-2.5 text-center font-semibold text-ink">
                  Sign in
                </Link>
                <Link href="/signup" className="rounded-lg bg-brand-700 px-4 py-2.5 text-center font-semibold text-white">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
