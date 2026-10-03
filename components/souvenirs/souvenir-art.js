import { cn } from "@/components/ui/cn";
import { WeaveBorder } from "@/components/ui/weave";
import { SouvenirIcon } from "@/components/souvenirs/souvenir-icon";

const VARIANTS = ["gamosa", "temple", "shawl"];

function variantFor(seed = "") {
  let hash = 0;
  for (const character of seed) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return VARIANTS[hash % VARIANTS.length];
}

/**
 * The stand-in for a souvenir without a real photo: a woven band and the category icon.
 * Deliberately not a stock image — travelers should never mistake it for the real product.
 */
export function SouvenirArt({ name, icon, label, className }) {
  const variant = variantFor(name);

  return (
    <div role="img" aria-label={name} className={cn("absolute inset-0 flex flex-col bg-gradient-to-br from-accent-soft via-surface-muted to-brand-soft", className)}>
      <WeaveBorder variant={variant} height={10} className="opacity-80" />
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface/85 text-accent-ink shadow-sm ring-1 ring-line">
          <SouvenirIcon icon={icon} className="h-7 w-7" />
        </span>
        {label ? <span className="text-xs font-medium text-ink-muted">{label}</span> : null}
      </div>
      <WeaveBorder variant={variant} height={10} className="opacity-80" />
    </div>
  );
}
