import prisma from "@/lib/db";

export async function listRecommendationsForUser(userId, { limit = 6 } = {}) {
  return prisma.recommendation.findMany({
    where: {
      userId,
    },
    include: {
      destination: {
        include: {
          village: true,
          photos: {
            orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
          },
          destinationCategories: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export function getRecommendationHighlights() {
  return [
    {
      title: "Hidden cultural trails",
      description: "Personalized routes for villages, craft hubs, and lesser-known heritage sites.",
      accent: "From heritage to living culture",
    },
    {
      title: "Seasonal experiences",
      description: "Discover festivals, ecological events, and local food journeys aligned to travel dates.",
      accent: "Curated around your calendar",
    },
    {
      title: "Responsible travel",
      description: "Promote low-impact experiences that support local communities and conservation efforts.",
      accent: "Balanced for visitors and hosts",
    },
  ];
}
