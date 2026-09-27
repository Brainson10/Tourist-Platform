import { cn } from "@/components/ui/cn";

/**
 * Woven-textile accents inspired by Northeast Indian handlooms:
 *  - "gamosa"  – the lozenge border of the Assamese gamosa
 *  - "temple"  – the stepped triangle of Manipur's Moirang Phee
 *  - "shawl"   – banded stripes of Naga shawls
 * Patterns are defined once (WeaveDefs in the root layout) and referenced by id.
 * Colours are token classes, so they follow light/dark mode. Decorative only.
 */
export function WeaveDefs() {
  return (
    <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute h-0 w-0 overflow-hidden">
      <defs>
        <pattern id="weave-gamosa" width="28" height="12" patternUnits="userSpaceOnUse">
          <rect width="28" height="1.5" className="fill-accent-500" />
          <rect y="10.5" width="28" height="1.5" className="fill-accent-500" />
          <polygon points="8,2.5 11.5,6 8,9.5 4.5,6" className="fill-accent-500" />
          <polygon points="8,4.5 9.5,6 8,7.5 6.5,6" className="fill-marigold-400" />
          <rect x="18" y="5" width="2" height="2" className="fill-brand-600" />
          <rect x="22" y="5" width="2" height="2" className="fill-brand-600" />
        </pattern>

        <pattern id="weave-temple" width="16" height="12" patternUnits="userSpaceOnUse">
          <polygon points="0,12 8,2 16,12" className="fill-accent-600" />
          <polygon points="4,12 8,7 12,12" className="fill-marigold-400" />
          <rect x="7" y="0" width="2" height="1.5" className="fill-brand-600" />
        </pattern>

        <pattern id="weave-shawl" width="12" height="16" patternUnits="userSpaceOnUse">
          <rect width="12" height="16" className="fill-night" />
          <rect y="4" width="12" height="3" className="fill-accent-600" />
          <rect y="7.5" width="12" height="1" className="fill-marigold-400" />
          <rect y="9" width="12" height="3" className="fill-accent-600" />
          <rect x="5" y="5" width="2" height="1" className="fill-marigold-300" />
          <rect x="5" y="10" width="2" height="1" className="fill-marigold-300" />
          <rect y="14" width="12" height="0.75" className="fill-brand-500" />
        </pattern>
      </defs>
    </svg>
  );
}

/** A full-width woven strip, e.g. along the top of the header or hero. */
export function WeaveBorder({ variant = "gamosa", height = 12, className }) {
  return (
    <svg aria-hidden="true" focusable="false" className={cn("block w-full", className)} height={height} preserveAspectRatio="none">
      <rect width="100%" height={height} fill={`url(#weave-${variant})`} />
    </svg>
  );
}

/** A short centred motif between two hairlines, used between sections. */
export function WeaveDivider({ className }) {
  return (
    <div aria-hidden="true" className={cn("flex items-center gap-4", className)}>
      <span className="h-px flex-1 bg-line" />
      <svg width="84" height="12" className="shrink-0">
        <rect width="84" height="12" fill="url(#weave-gamosa)" />
      </svg>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
