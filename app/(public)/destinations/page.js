import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { filterDestinations, searchDestinations } from "@/services/destination";

export const metadata = {
  title: "Destinations",
  description: "Discover intelligent destination recommendations across Northeast India.",
};

function getSearchValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DestinationsPage({ searchParams }) {
  const params = await searchParams;
  const query = getSearchValue(params?.q)?.trim();
  const category = getSearchValue(params?.category)?.trim();
  let data = {
    results: [],
    aiSuggestions: [],
  };
  let loadError = null;

  try {
    data = query
      ? await searchDestinations({ q: query, category, limit: 24 })
      : { results: await filterDestinations({ category, limit: 24 }), aiSuggestions: [] };
  } catch {
    loadError = "Destination intelligence is temporarily unavailable. Check that PostgreSQL is running and migrations are applied.";
  }

  const destinations = data.results;

  return (
    <PageShell
      title="Discover Destinations"
      description="Search by place, food, festival, nature, wildlife, culture, or the kind of journey you want to experience."
    >
      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]" action="/destinations">
        <label className="sr-only" htmlFor="destination-query">
          Search destinations
        </label>
        <input
          id="destination-query"
          name="q"
          defaultValue={query ?? ""}
          placeholder="Weekend trip, waterfalls, food, photography..."
          className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-sky-700"
        />

        <label className="sr-only" htmlFor="destination-category">
          Category
        </label>
        <select
          id="destination-category"
          name="category"
          defaultValue={category ?? ""}
          className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-sky-700"
        >
          <option value="">All categories</option>
          <option value="Nature">Nature</option>
          <option value="Culture">Culture</option>
          <option value="Food">Food</option>
          <option value="Wildlife">Wildlife</option>
          <option value="Spiritual">Spiritual</option>
          <option value="Adventure">Adventure</option>
        </select>

        <button className="rounded-lg bg-sky-700 px-6 py-3 font-semibold text-white transition hover:bg-sky-800">
          Search
        </button>
      </form>

      {loadError ? (
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-800">
            Data Connection
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">
            We could not load destinations right now.
          </h2>
          <p className="mt-2 leading-7 text-slate-700">
            {loadError}
          </p>
        </div>
      ) : null}

      {!loadError && query && data.aiSuggestions.length ? (
        <div className="mt-8 rounded-lg border border-sky-100 bg-sky-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-800">
            AI Suggestion
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">
            {data.aiSuggestions[0].title}
          </h2>
          <p className="mt-2 leading-7 text-slate-700">
            {data.aiSuggestions[0].description}
          </p>
        </div>
      ) : null}

      {!loadError && destinations.length ? (
        <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {destinations.map((destination) => (
            <article key={destination.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="relative h-56">
                <Image
                  src={destination.heroImage}
                  alt={destination.name}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-sky-700">
                  {[destination.district, destination.state].filter(Boolean).join(", ")}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  {destination.name}
                </h2>
                <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
                  {destination.shortDescription}
                </p>
                <Link
                  href={`/destinations/${destination.slug}`}
                  className="mt-6 inline-flex rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
                >
                  View Guide
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : !loadError ? (
        <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-xl font-semibold text-slate-950">
            No matching destinations yet.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-600">
            Try a broader interest like culture, nature, food, wildlife, or festivals while the intelligence layer grows.
          </p>
        </div>
      ) : null}
    </PageShell>
  );
}
