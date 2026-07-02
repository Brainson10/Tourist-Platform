import Image from "next/image";
import Link from "next/link";
import SearchBar from "./search-bar";
import QuickFilters from "./quick-filters";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-lg">
      <Image
        src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85"
        alt="Misty green mountain landscape"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.84)_0%,_rgba(14,116,144,0.64)_48%,_rgba(240,249,255,0.35)_100%)]" />

      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col items-start justify-center px-5 py-20 text-left sm:px-8 lg:px-10">
        <div className="mb-6 rounded-full border border-white/30 bg-white/15 px-5 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur">
          AI Powered Smart Tourism Platform
        </div>

        <h1 className="max-w-5xl text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-7xl">
          Discover Northeast India through personalized experiences
        </h1>

        <p className="mt-7 max-w-3xl text-lg leading-8 text-sky-50 md:text-xl">
          Search destinations, festivals, food trails, cultural stories, and
          nature escapes with a smarter tourism experience built around how you
          want to travel.
        </p>

        <div className="mt-10 w-full max-w-4xl">
          <SearchBar />
        </div>

        <div className="mt-7">
          <QuickFilters />
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/destinations" className="rounded-lg bg-white px-7 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-50">
            Explore Destinations
          </Link>

          <Link href="/dashboard" className="rounded-lg border border-white/40 bg-white/10 px-7 py-4 text-base font-bold text-white shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">
            Plan My Trip
          </Link>
        </div>
      </div>
    </section>
  );
}
