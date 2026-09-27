import Link from "next/link";
import { cn } from "@/components/ui/cn";
import { WeaveBorder } from "@/components/ui/weave";

// A stylised tile cartogram of the eight Northeast states: positions follow real geography loosely,
// but it deliberately does not draw borders.
const STATES = [
  { name: "Sikkim", short: "SK", area: "[grid-area:sik]", motif: "Monasteries & peaks" },
  { name: "Arunachal Pradesh", short: "AR", area: "[grid-area:aru]", motif: "Land of the dawn-lit mountains" },
  { name: "Assam", short: "AS", area: "[grid-area:ass]", motif: "Tea, rhinos & the Brahmaputra" },
  { name: "Nagaland", short: "NL", area: "[grid-area:nag]", motif: "Hornbill & hill villages" },
  { name: "Meghalaya", short: "ML", area: "[grid-area:meg]", motif: "Clouds & living-root bridges" },
  { name: "Manipur", short: "MN", area: "[grid-area:man]", motif: "Loktak & classical dance" },
  { name: "Tripura", short: "TR", area: "[grid-area:tri]", motif: "Palaces & temples" },
  { name: "Mizoram", short: "MZ", area: "[grid-area:miz]", motif: "Blue hills & bamboo" },
];

const GRID =
  "[grid-template-areas:'sik_sik_._aru_aru_aru_aru_aru'_'._ass_ass_ass_ass_nag_nag_.'_'._meg_meg_._._man_man_.'_'._._tri_tri_miz_miz_._.']";

export function StateMap({ counts = {} }) {
  return (
    <nav aria-label="Explore by state" className="relative">
      <div className={cn("grid grid-cols-8 grid-rows-4 gap-1.5 sm:gap-2", GRID)}>
        {STATES.map((state) => {
          const count = counts[state.name] ?? 0;
          const body = (
            <>
              {count ? <WeaveBorder height={5} className="absolute inset-x-0 top-0 opacity-80" /> : null}
              <span className="font-display text-sm font-semibold leading-tight sm:text-base">
                <span className="sm:hidden">{state.short}</span>
                <span className="hidden sm:inline">{state.name}</span>
              </span>
              {count ? <span className="mt-0.5 hidden text-[11px] leading-snug opacity-80 lg:block">{state.motif}</span> : null}
              <span className="mt-auto text-[11px] font-medium opacity-80">{count ? `${count} place${count === 1 ? "" : "s"}` : "Coming soon"}</span>
            </>
          );
          const tileClass =
            "relative flex min-h-[4.25rem] flex-col overflow-hidden rounded-xl border p-2 pt-3 text-left transition-all sm:min-h-[5.5rem] sm:p-3 sm:pt-4";

          return (
            <div key={state.name} className={state.area}>
              {count ? (
                <Link
                  href={`/destinations?state=${encodeURIComponent(state.name)}`}
                  className={cn(tileClass, "h-full border-brand-soft-line bg-brand-soft text-brand-strong hover:-translate-y-0.5 hover:border-accent-500 hover:shadow-md")}
                  aria-label={`${state.name}: ${count} destination${count === 1 ? "" : "s"}`}
                >
                  {body}
                </Link>
              ) : (
                <div className={cn(tileClass, "h-full border-dashed border-line bg-surface/60 text-ink-subtle")} aria-label={`${state.name}: coming soon`}>
                  {body}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
