import StatCard from "./stat-card";

const stats = [
  { value: "100+", label: "Destinations" },
  { value: "500+", label: "Experiences" },
  { value: "50+", label: "Festivals" },
  { value: "24/7", label: "AI Assistant" },
  { value: "1000+", label: "Community Stories" },
];

export default function StatsSection() {
  return (
    <section className="py-24">
      <div className="rounded-lg bg-[linear-gradient(135deg,_#0f172a_0%,_#075985_55%,_#047857_100%)] px-5 py-14 shadow-xl sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-semibold uppercase tracking-widest text-sky-100">
            Platform scale
          </p>
          <h2 className="mt-3 text-4xl font-bold text-white md:text-5xl">
            Designed for a growing tourism intelligence network
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              {...stat}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
