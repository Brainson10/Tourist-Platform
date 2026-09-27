"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";

export const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/destinations", label: "Destinations" },
  { href: "/admin/villages", label: "Villages" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/experiences", label: "Experiences" },
  { href: "/admin/festivals", label: "Festivals" },
  { href: "/admin/stories", label: "Stories" },
  { href: "/admin/reviews", label: "Reviews", badgeKey: "pendingReviews" },
  { href: "/admin/guides", label: "Guides", badgeKey: "pendingGuides" },
  { href: "/admin/permits", label: "Permits" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({ badges = {} }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="relative scrollbar-none flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {ADMIN_NAV.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const badge = item.badgeKey ? badges[item.badgeKey] : 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            {item.label}
            {badge ? <span className="rounded-full bg-marigold-400 px-1.5 text-xs font-semibold text-ink">{badge}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
