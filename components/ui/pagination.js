import Link from "next/link";
import { cn } from "@/components/ui/cn";

function pageHref(basePath, params, page) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== "" && key !== "page") search.set(key, String(value));
  }

  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({ meta, basePath, params, className }) {
  if (!meta || meta.totalPages <= 1) return null;

  const { page, totalPages } = meta;
  const linkClass = "inline-flex h-9 items-center rounded-lg border border-line-strong bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-muted";

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-between gap-3", className)}>
      {page > 1 ? (
        <Link href={pageHref(basePath, params, page - 1)} className={linkClass} rel="prev">
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-ink-muted">
        Page {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link href={pageHref(basePath, params, page + 1)} className={linkClass} rel="next">
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
