import { Search } from "lucide-react";
import { StateMap } from "@/components/home/state-map";
import { WeaveBorder } from "@/components/ui/weave";

export function HeroSearch({ stateCounts, totalDestinations, searchSlot }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-canvas">
      {/* Soft paper texture from layered radial washes — no image request needed. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_85%_-10%,var(--color-brand-soft),transparent_70%),radial-gradient(40rem_24rem_at_-10%_110%,var(--color-accent-soft),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs font-medium text-ink-muted">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            Eight states · {totalDestinations} places to explore
          </p>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
            Journeys through the <span className="text-accent-600 dark:text-accent-400">hills, rivers</span> and festivals of Northeast India
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-lg text-ink-muted">
            Find where to go and when, what to eat and who to go with — plus permits, weather and nearby essentials for every place.
          </p>
          <div className="mt-8 max-w-xl">
            {searchSlot ?? (
              <form action="/destinations" role="search" className="flex gap-2 rounded-full border border-line-strong bg-surface p-1.5 shadow-sm">
                <label htmlFor="hero-search" className="sr-only">
                  Search destinations
                </label>
                <Search aria-hidden="true" className="ml-3 h-5 w-5 self-center text-ink-subtle" />
                <input id="hero-search" name="q" type="search" placeholder="Try “Loktak”, “monastery” or “Meghalaya”" className="h-11 min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-subtle focus:outline-none" />
                <button type="submit" className="h-11 rounded-full bg-brand-700 px-6 font-semibold text-white hover:bg-brand-800">
                  Search
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="relative rounded-3xl border border-line bg-surface/70 p-4 shadow-sm backdrop-blur sm:p-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-ink">Pick a state</h2>
            <span className="text-xs text-ink-subtle">Tap a tile to explore</span>
          </div>
          <StateMap counts={stateCounts} />
        </div>
      </div>
      <WeaveBorder height={12} />
    </section>
  );
}
