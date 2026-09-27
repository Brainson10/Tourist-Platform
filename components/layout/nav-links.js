"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";
import { MAIN_NAV } from "@/components/layout/nav-config";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {MAIN_NAV.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn("rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-surface-muted text-ink" : "text-ink-muted hover:text-ink")}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
