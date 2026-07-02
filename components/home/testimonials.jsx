import TestimonialCard from "./testimonial-card";

const testimonials = [
  {
    name: "Maya Wilson",
    country: "United Kingdom",
    rating: "5.0 rating",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=85",
    review: "The experience-first approach helped me imagine a journey around food, lakes, and local stories instead of just ticking places off a list.",
  },
  {
    name: "Arjun Mehta",
    country: "India",
    rating: "4.9 rating",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=85",
    review: "I loved how the platform frames travel around culture and safety. It feels built for people who want to understand where they are going.",
  },
  {
    name: "Sofia Chen",
    country: "Singapore",
    rating: "5.0 rating",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=85",
    review: "The festival and village discovery ideas make Northeast India feel approachable, respectful, and full of meaningful routes.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24">
      <div className="text-center">
        <p className="font-semibold uppercase tracking-widest text-sky-700">
          Traveler voices
        </p>

        <h2 className="mt-3 text-4xl font-bold text-slate-950 md:text-5xl">
          Reviews from curious travelers
        </h2>

        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          Mock reviews show the tone of trust, clarity, and cultural depth the
          live platform should earn from real travelers.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <TestimonialCard
            key={testimonial.name}
            {...testimonial}
          />
        ))}
      </div>
    </section>
  );
}
