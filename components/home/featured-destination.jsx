import DestinationCard from "./destination-card";

const destinations = [
  {
    title: "Loktak Lake",
    location: "Bishnupur, Manipur",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
    description: "Floating phumdis, sunrise boat rides, wetland life, and island villages shaped by water.",
    href: "/destinations",
  },
  {
    title: "Kangla Fort",
    location: "Imphal, Manipur",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=85",
    description: "A historic cultural core with sacred spaces, royal memory, and powerful storytelling potential.",
    href: "/destinations",
  },
  {
    title: "Shirui Hills",
    location: "Ukhrul, Manipur",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
    description: "Rolling highland meadows, seasonal blooms, village culture, and cool mountain air.",
    href: "/destinations",
  },
  {
    title: "Dzukou Valley",
    location: "Manipur and Nagaland",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=85",
    description: "A soft green trekking landscape known for wide views, silence, and seasonal wildflowers.",
    href: "/destinations",
  },
  {
    title: "Sendenyu Village",
    location: "Tseminyu, Nagaland",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
    description: "Community heritage, rural hospitality, terrace landscapes, and slower cultural travel.",
    href: "/destinations",
  },
  {
    title: "Keibul Lamjao",
    location: "Bishnupur, Manipur",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1549366021-9f761d040a94?auto=format&fit=crop&w=1200&q=85",
    description: "The floating national park, home to rare wetland ecology and the iconic Sangai deer.",
    href: "/destinations",
  },
];

export default function FeaturedDestinations() {
  return (
    <section className="py-24" id="destinations">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="font-semibold uppercase tracking-widest text-sky-700">
            Explore
          </p>

          <h2 className="mt-3 text-4xl font-bold text-slate-950 md:text-5xl">
            Featured Destinations
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-600">
            Discover some of the most beautiful places across Northeast India,
            selected for memorable, responsible, and story-rich travel.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination.title}
              {...destination}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
