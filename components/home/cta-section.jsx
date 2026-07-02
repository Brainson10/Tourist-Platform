import Link from "next/link";

export default function CTASection() {
  return (
    <section className="pb-24">
      <div className="rounded-lg bg-[linear-gradient(135deg,_#ecfeff_0%,_#ffffff_48%,_#ecfdf5_100%)] px-6 py-16 text-center shadow-sm sm:px-10">
        <p className="font-semibold uppercase tracking-widest text-sky-700">
          Begin your journey
        </p>

        <h2 className="mx-auto mt-3 max-w-4xl text-4xl font-black text-slate-950 md:text-6xl">
          Plan a trip that understands your interests before it suggests a place
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Explore mock discovery paths today. Later, this surface can connect to
          real AI planning, verified destinations, local guides, and travel
          safety intelligence.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/destinations" className="rounded-lg bg-slate-950 px-7 py-4 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-700">
            Start Exploring
          </Link>
          <Link href="/signup" className="rounded-lg border border-slate-300 bg-white px-7 py-4 font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50">
            Create Free Account
          </Link>
        </div>
      </div>
    </section>
  );
}
