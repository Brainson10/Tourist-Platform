import Link from "next/link";

/** Woven lozenge mark + wordmark. The mark echoes the gamosa border motif. */
export function BrandMark({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect x="1" y="1" width="30" height="30" rx="9" className="fill-brand-700" />
      <polygon points="16,6 26,16 16,26 6,16" className="fill-accent-500" />
      <polygon points="16,11 21,16 16,21 11,16" className="fill-marigold-400" />
      <rect x="15" y="15" width="2" height="2" className="fill-brand-800" />
    </svg>
  );
}

export function Brand({ tone = "default" }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Smart Tourism home">
      <BrandMark />
      <span className={`font-display text-[1.15rem] font-semibold leading-none tracking-tight ${tone === "light" ? "text-white" : "text-ink"}`}>
        Smart Tourism
      </span>
    </Link>
  );
}
