export default function SearchBar() {
  return (
    <div className="w-full rounded-lg border border-white/40 bg-white/95 shadow-2xl backdrop-blur">
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
        <label htmlFor="home-search" className="sr-only">
          Search destinations, experiences, festivals, or travel ideas
        </label>

        <input
          id="home-search"
          type="text"
          placeholder="Try Loktak sunrise, village stay, food trail, waterfalls..."
          className="min-h-12 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 sm:text-lg"
        />

        <button type="button" className="rounded-lg bg-sky-700 px-6 py-3 font-semibold text-white transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-700 focus:ring-offset-2">
          Search
        </button>
      </div>

      <div className="border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
        Popular: Loktak Lake, Sangai Festival, Shirui Hills, cultural homestay
      </div>
    </div>
  );
}
