"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/actions/auth/logout";
import { ACCOUNT_NAV } from "@/components/layout/nav-config";
import { initials } from "@/lib/utils/initials";

export function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (event.type === "keydown" ? event.key === "Escape" : !ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-sm font-medium text-ink hover:border-line-strong"
      >
        <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-brand-700 text-xs font-semibold text-white">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element -- tiny avatar from mixed hosts
            <img src={user.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(user.fullName)
          )}
        </span>
        <span className="hidden max-w-28 truncate sm:inline">{user.fullName.split(" ")[0]}</span>
        <span className="sr-only">Open account menu</span>
      </button>

      {open ? (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{user.fullName}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>
          {ACCOUNT_NAV.map((link) => (
            <Link key={link.href} role="menuitem" href={link.href} onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink">
              {link.label}
            </Link>
          ))}
          <Link role="menuitem" href={user.role === "GUIDE" ? "/guide" : "/guide/apply"} onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink">
            {user.role === "GUIDE" ? "Guide dashboard" : "Become a guide"}
          </Link>
          {user.role === "ADMIN" ? (
            <Link role="menuitem" href="/admin" onClick={() => setOpen(false)} className="block border-t border-line px-4 py-2 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink">
              Admin panel
            </Link>
          ) : null}
          <form action={logoutAction} className="border-t border-line">
            <button role="menuitem" type="submit" className="block w-full px-4 py-2 text-left text-sm text-danger-ink hover:bg-danger-soft">
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
