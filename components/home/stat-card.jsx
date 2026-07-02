export default function StatCard({
  value,
  label,
}) {
  return (
    <div className="rounded-lg border border-white/20 bg-white/10 p-6 text-center shadow-sm backdrop-blur">
      <div className="animate-pulse text-4xl font-black text-white md:text-5xl">
        {value}
      </div>
      <p className="mt-3 font-semibold text-sky-50">
        {label}
      </p>
    </div>
  );
}
