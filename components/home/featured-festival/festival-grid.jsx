import FestivalCard from "./festival-card";

export default function FestivalGrid({ festivals }) {
  if (!festivals.length) {
    return (
      <div className="mt-14 rounded-lg border border-dashed border-slate-300 bg-white/70 p-10 text-center">
        <h3 className="text-xl font-semibold text-slate-950">
          Featured festivals are being curated.
        </h3>
        <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-600">
          Add featured festival records from the admin layer to surface timely
          cultural experiences here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {festivals.map((festival) => (
        <FestivalCard key={festival.id} festival={festival} />
      ))}
    </div>
  );
}
