const filters = [
  "Adventure",
  "Nature",
  "Culture",
  "Food",
  "Festivals",
  "Wildlife",
  "Spiritual",
];

export default function QuickFilters() {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((item) => (
        <button
          key={item}
          type="button"
          className="rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-white/70"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
