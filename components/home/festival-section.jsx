import FestivalCard from "./festival-card";

const festivals = [
  {
    title: "Yaoshang",
    month: "March",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=85",
    description: "A vibrant spring celebration blending community sports, music, color, and cultural gatherings.",
  },
  {
    title: "Sangai Festival",
    month: "November",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=85",
    description: "A major tourism festival showcasing Manipur's dance, food, craft, sport, and indigenous heritage.",
  },
  {
    title: "Lui Ngai Ni",
    month: "February",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85",
    description: "A seed-sowing festival honoring Naga identity, songs, dances, rituals, and community bonds.",
  },
  {
    title: "Kut Festival",
    month: "November",
    image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=1200&q=85",
    description: "A harvest celebration of gratitude, traditional attire, music, food, and joyful social gathering.",
  },
];

export default function FestivalSection() {
  return (
    <section className="py-24" id="festivals">
      <div className="rounded-lg bg-[linear-gradient(135deg,_#fff7ed_0%,_#ffffff_46%,_#eef6ff_100%)] px-5 py-14 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <p className="font-semibold uppercase tracking-widest text-amber-700">
            Cultural calendar
          </p>

          <h2 className="mt-3 text-4xl font-bold text-slate-950 md:text-5xl">
            Travel with the rhythm of festivals
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Seasonal celebrations help travelers understand place through food,
            performance, community memory, and shared public life.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {festivals.map((festival) => (
            <FestivalCard
              key={festival.title}
              {...festival}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
