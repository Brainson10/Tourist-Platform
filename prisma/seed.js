import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@tourism-platform.com" },
    update: {},
    create: {
      fullName: "Admin User",
      email: "admin@tourism-platform.com",
      passwordHash,
      role: "ADMIN",
      phone: "+919876543210",
    },
  });

  const tourist = await prisma.user.upsert({
    where: { email: "tourist@tourism-platform.com" },
    update: {},
    create: {
      fullName: "Tourist User",
      email: "tourist@tourism-platform.com",
      passwordHash: await bcrypt.hash("Tourist@123", 10),
      role: "TOURIST",
      phone: "+919812345678",
    },
  });

  const destinationProfiles = [
    {
      name: "Kaziranga National Park",
      slug: "kaziranga",
      description: "A UNESCO World Heritage site famed for one-horned rhinoceros and lush grasslands.",
      shortDescription: "Rhino country, riverine forests, wetlands, and community-led wildlife experiences.",
      fullDescription:
        "Kaziranga National Park is one of India's most important wildlife landscapes, where tall elephant grass, wetlands, and forest corridors support rhinos, elephants, swamp deer, wild buffalo, and migratory birds. The destination is best experienced through responsible safaris, village walks, conservation interpretation, and slow travel around the Brahmaputra floodplain.",
      state: "Assam",
      district: "Golaghat",
      latitude: 26.57,
      longitude: 93.17,
      coverImage: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2",
      heroImage: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2",
      galleryImages: [
        "https://images.unsplash.com/photo-1549366021-9f761d040a94",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      ],
      bestSeason: "November to April",
      openingHours: "Safari gates usually operate in morning and afternoon slots during the open season.",
      estimatedDuration: "2 to 3 days",
      entryFee: "Varies by safari zone, vehicle type, and visitor category.",
      accessibility: "Safari vehicles are available, but many forest routes are uneven. Confirm accessible vehicle support before travel.",
      safetyInfo: "Follow forest department rules, remain inside authorized vehicles, and avoid approaching wildlife.",
      emergencyContacts: [
        { label: "Emergency", value: "112" },
        { label: "Kaziranga Police", value: "Local police station" },
      ],
      tags: ["wildlife", "unesco", "safari", "nature", "community"],
      categories: ["Wildlife", "Nature", "Culture"],
      history: "Kaziranga's conservation story began in the early twentieth century and is closely tied to protecting the Indian one-horned rhinoceros.",
      culture: "Nearby communities contribute to guiding, crafts, food, and conservation awareness programs around the park.",
      religion: "The wider region reflects Assamese cultural life with temples, namghars, and community worship spaces.",
      traditions: "Local weaving, folk music, seasonal fairs, and agrarian traditions shape the visitor experience beyond safaris.",
      language: "Assamese is widely spoken, with English and Hindi commonly used in tourism settings.",
      food: "Try Assamese thalis, tenga fish curry, rice preparations, bamboo shoot dishes, and local tea.",
      thingsToDo: ["Jeep safari", "Birding", "Village heritage walk", "Tea garden visit", "Conservation interpretation"],
      nearbyAttractions: ["Orchid and Biodiversity Park", "Kakochang Waterfalls", "Brahmaputra river belt"],
      transportation: "Road access is common from Guwahati, Jorhat, and Tezpur. The nearest rail and air connections depend on the chosen park range.",
      hotels: [
        { name: "Eco lodges near Kohora", type: "Eco stay" },
        { name: "Wildlife resorts around Kaziranga", type: "Resort" },
      ],
      homestays: [
        { name: "Community homestays near fringe villages", type: "Homestay" },
      ],
      hiddenGems: ["Early morning birding near wetlands", "Local craft stops", "Tea garden sunset viewpoints"],
      isFeatured: true,
    },
    {
      name: "Tawang",
      slug: "tawang",
      description: "A high-altitude town known for monasteries, valleys, and scenic mountain roads.",
      shortDescription: "A Himalayan culture, monastery, and mountain-road journey in western Arunachal Pradesh.",
      fullDescription:
        "Tawang combines high-altitude landscapes with Monpa culture, Buddhist heritage, dramatic roads, lakes, and borderland history. It rewards travelers who prepare for altitude, respect monastery etiquette, and plan slow days around weather and road conditions.",
      state: "Arunachal Pradesh",
      district: "Tawang",
      latitude: 27.59,
      longitude: 91.86,
      coverImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      heroImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      galleryImages: [
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        "https://images.unsplash.com/photo-1516483638261-f4dbaf036963",
      ],
      bestSeason: "March to June and September to October",
      openingHours: "Outdoor access depends on weather, road conditions, and local advisories.",
      estimatedDuration: "4 to 6 days",
      entryFee: "Most town experiences are free; permits, transport, and guided visits vary.",
      accessibility: "High altitude, steep roads, and cold weather can be challenging. Travelers should plan acclimatization time.",
      safetyInfo: "Monitor road advisories, carry warm layers, and avoid rushing high-altitude travel.",
      emergencyContacts: [
        { label: "Emergency", value: "112" },
        { label: "Tourist support", value: "District tourism office" },
      ],
      tags: ["monastery", "himalaya", "culture", "spiritual", "mountains"],
      categories: ["Culture", "Spiritual", "Nature"],
      history: "Tawang has deep historical links with Himalayan Buddhist networks and strategic mountain routes.",
      culture: "Monpa traditions, monastery life, prayer flags, crafts, and local food define the destination's cultural rhythm.",
      religion: "Tibetan Buddhism is central to Tawang's identity, with Tawang Monastery as a major spiritual landmark.",
      traditions: "Losar celebrations, mask dances, weaving, and community rituals are important cultural expressions.",
      language: "Monpa languages are spoken locally, while Hindi and English are common in visitor-facing areas.",
      food: "Try thukpa, momos, zan, butter tea, and local highland dishes.",
      thingsToDo: ["Visit Tawang Monastery", "Explore high-altitude lakes", "Attend cultural festivals", "Walk local markets", "Learn monastery etiquette"],
      nearbyAttractions: ["Sela Pass", "Madhuri Lake", "Nuranang Falls", "Urgelling Monastery"],
      transportation: "Road travel through mountain passes is the primary access route. Build buffer days for weather delays.",
      hotels: [
        { name: "Town hotels around Tawang market", type: "Hotel" },
        { name: "Mountain-view guesthouses", type: "Guesthouse" },
      ],
      homestays: [
        { name: "Monpa family homestays", type: "Homestay" },
      ],
      hiddenGems: ["Quiet monastery courtyards at sunrise", "Local weaving shops", "Small viewpoints outside town"],
      isFeatured: true,
    },
    {
      name: "Shillong",
      slug: "shillong",
      description: "The misty hill station of Meghalaya known for lakes, gardens, and local culture.",
      shortDescription: "Music, markets, pine hills, food, and day trips into Meghalaya's living landscapes.",
      fullDescription:
        "Shillong is a compact hill city where Khasi culture, music, cafes, local markets, viewpoints, waterfalls, and nearby villages create an easy gateway into Meghalaya. It works well for first-time travelers who want culture, food, nature, and flexible day trips.",
      state: "Meghalaya",
      district: "East Khasi Hills",
      latitude: 25.57,
      longitude: 91.88,
      coverImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      heroImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      galleryImages: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      ],
      bestSeason: "October to April",
      openingHours: "City attractions vary by site; markets are liveliest during daytime and early evening.",
      estimatedDuration: "2 to 4 days",
      entryFee: "Most city experiences are low cost; individual parks and viewpoints may charge small fees.",
      accessibility: "Central areas are reachable by road, though slopes, traffic, and rain can affect mobility.",
      safetyInfo: "Plan transport for late evenings, check rain forecasts, and follow local guidance for waterfall visits.",
      emergencyContacts: [
        { label: "Emergency", value: "112" },
        { label: "Tourist support", value: "Meghalaya tourism information center" },
      ],
      tags: ["food", "music", "markets", "waterfalls", "culture"],
      categories: ["Food", "Culture", "Nature"],
      history: "Shillong developed as an important hill station and administrative center, shaped by Khasi heritage and colonial-era institutions.",
      culture: "The city is known for Khasi identity, music scenes, markets, football culture, and strong community networks.",
      religion: "Christian communities are prominent, alongside indigenous traditions and diverse urban faith practices.",
      traditions: "Market culture, music, seasonal festivals, and Khasi community practices give Shillong its social character.",
      language: "Khasi, English, and Hindi are widely used in and around Shillong.",
      food: "Try jadoh, dohneiiong, tungrymbai, smoked meats, local snacks, and cafe culture.",
      thingsToDo: ["Explore Police Bazaar", "Visit Ward's Lake", "Try Khasi food", "Listen to live music", "Take waterfall day trips"],
      nearbyAttractions: ["Umiam Lake", "Elephant Falls", "Laitlum Canyon", "Mawphlang Sacred Grove"],
      transportation: "Road travel from Guwahati is common. Shared taxis and local cabs connect city areas and day-trip points.",
      hotels: [
        { name: "Boutique stays in central Shillong", type: "Hotel" },
        { name: "Guesthouses near Laitumkhrah", type: "Guesthouse" },
      ],
      homestays: [
        { name: "Khasi family homestays around East Khasi Hills", type: "Homestay" },
      ],
      hiddenGems: ["Early morning market walks", "Small music venues", "Quiet viewpoints around Laitlum"],
      isFeatured: true,
    },
  ];

  const destinations = await Promise.all(
    destinationProfiles.map((destination) =>
      prisma.destination.upsert({
        where: { slug: destination.slug },
        update: destination,
        create: destination,
      })
    )
  );

  const kaziranga = destinations[0];
  const tawang = destinations[1];
  const shillong = destinations[2];

  await prisma.experience.createMany({
    data: [
      {
        destinationId: kaziranga.id,
        title: "Elephant Grassland Safari",
        description: "A guided safari through the rolling grasslands with wildlife spotting.",
        category: "WILDLIFE",
        difficulty: "Moderate",
        duration: "3 hours",
        price: 1200,
      },
      {
        destinationId: kaziranga.id,
        title: "Village Heritage Walk",
        description: "Meet local communities and experience traditional hospitality.",
        category: "CULTURE",
        difficulty: "Easy",
        duration: "2 hours",
        price: 600,
      },
      {
        destinationId: tawang.id,
        title: "Monastery Trail",
        description: "Discover sacred architecture and high-altitude traditions.",
        category: "SPIRITUAL",
        difficulty: "Moderate",
        duration: "4 hours",
        price: 900,
      },
      {
        destinationId: shillong.id,
        title: "Local Food Discovery Tour",
        description: "Taste regional street food and seasonal market favorites.",
        category: "FOOD",
        difficulty: "Easy",
        duration: "2 hours",
        price: 700,
      },
      {
        destinationId: shillong.id,
        title: "Cloud-Kissed Nature Walk",
        description: "Enjoy a scenic walk through pine forests and viewpoints.",
        category: "NATURE",
        difficulty: "Easy",
        duration: "2.5 hours",
        price: 800,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.festival.createMany({
    data: [
      {
        destinationId: kaziranga.id,
        title: "Kaziranga Festival of Light",
        slug: "kaziranga-festival-of-light",
        startDate: new Date("2026-11-20"),
        endDate: new Date("2026-11-22"),
        description: "A cultural celebration with music, crafts, and wildlife awareness events.",
        imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200",
        category: "CULTURE",
        isFeatured: true,
      },
      {
        destinationId: tawang.id,
        title: "Tawang Losar",
        slug: "tawang-losar",
        startDate: new Date("2026-02-10"),
        endDate: new Date("2026-02-12"),
        description: "A festive celebration featuring rituals, dance, and local cuisine.",
        imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200",
        category: "FESTIVAL",
        isFeatured: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.trip.createMany({
    data: [
      {
        userId: tourist.id,
        title: "Northeast Cultural Escape",
        startDate: new Date("2026-10-01"),
        endDate: new Date("2026-10-05"),
        status: "PLANNING",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.recommendation.createMany({
    data: [
      {
        userId: tourist.id,
        destinationId: kaziranga.id,
        score: 95,
        reason: "Excellent wildlife and scenic value for a short getaway.",
      },
      {
        userId: tourist.id,
        destinationId: shillong.id,
        score: 92,
        reason: "Great for relaxed travel and local food experiences.",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.story.createMany({
    data: [
      {
        destinationId: kaziranga.id,
        title: "Guardians of the Grasslands",
        content: "Local guides share stories of rhinos, riverbanks, and the living landscape of Kaziranga.",
        language: "English",
      },
      {
        destinationId: tawang.id,
        title: "Mountain Monastery Voices",
        content: "Monastery elders recount the spiritual history of Tawang and its valleys.",
        language: "English",
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
