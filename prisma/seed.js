import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { parseBestMonths } from "../lib/utils/months.js";
import { seedSouvenirs } from "./seed-souvenirs.js";

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Demo accounts have well-known passwords, so they are only created when
 * SEED_DEMO_ACCOUNTS=true. Never enable this against a production database.
 */
async function seedDemoAccounts() {
  const accounts = [
    { fullName: "Admin User", email: "admin@tourism-platform.com", password: "Admin@123", role: "ADMIN" },
    { fullName: "Tourist User", email: "tourist@tourism-platform.com", password: "Tourist@123", role: "TOURIST" },
    { fullName: "Guide User", email: "guide@tourism-platform.com", password: "Guide@123", role: "GUIDE" },
  ];
  const users = {};

  for (const account of accounts) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: { fullName: account.fullName, email: account.email, role: account.role, emailVerified: true },
    });

    const existingCredential = await prisma.account.findFirst({ where: { userId: user.id, providerId: "credential" } });

    if (!existingCredential) {
      await prisma.account.create({
        data: {
          id: `acc_${user.id}`,
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: await bcrypt.hash(account.password, 12),
        },
      });
    }

    users[account.role] = user;
    console.log(`Demo ${account.role.toLowerCase()}: ${account.email} / ${account.password}`);
  }

  return users;
}

async function main() {
  const demoUsers = process.env.SEED_DEMO_ACCOUNTS === "true" ? await seedDemoAccounts() : null;

  const destinationProfiles = [
    {
      name: "Kaziranga National Park",
      slug: "kaziranga",
      villageName: "Kohora",
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
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
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
      villageName: "Tawang Town",
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
      villageName: "Laitumkhrah",
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
    {
      name: "Loktak Lake",
      slug: "loktak-lake",
      villageName: "Thanga",
      description: "A living freshwater lake landscape known for floating phumdis, fishing communities, and Keibul Lamjao National Park.",
      shortDescription: "Floating islands, lake villages, birding, boating, and slow community-led travel around Manipur's iconic lake.",
      fullDescription:
        "Loktak Lake is the largest freshwater lake in Northeast India and one of Manipur's most important ecological and cultural landscapes. Travelers can experience floating phumdis, fishing traditions, wetland birding, homestays, lake viewpoints, and responsible visits near Keibul Lamjao National Park, the habitat of the endangered sangai deer.",
      state: "Manipur",
      district: "Bishnupur",
      latitude: 24.5464,
      longitude: 93.8003,
      coverImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      heroImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      galleryImages: [
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      ],
      bestSeason: "October to March",
      openingHours: "Lake access depends on weather, boat availability, and local guidance.",
      estimatedDuration: "1 to 2 days",
      entryFee: "Viewpoints are usually low cost; boating and guided community experiences vary.",
      accessibility: "Road access is available to nearby settlements, but boat access and wetland edges may be difficult for some travelers.",
      safetyInfo: "Use local boat operators, wear life jackets, avoid unsafe monsoon boating, and follow wetland conservation rules.",
      emergencyContacts: [
        { label: "Emergency", value: "112" },
        { label: "Bishnupur District Support", value: "District administration helpline" },
      ],
      tags: ["lake", "wetland", "community", "birding", "sangai"],
      categories: ["Nature", "Culture", "Wildlife"],
      history: "Loktak has supported fishing communities, wetland livelihoods, and cultural memory across generations in Manipur.",
      culture: "Lake villages, fishing practices, food traditions, and community knowledge shape the visitor experience.",
      religion: "The surrounding region reflects Meitei and local community faith practices with temples and sacred local traditions.",
      traditions: "Fishing, boat making, seasonal lake life, and local food customs are central to the landscape.",
      language: "Manipuri is widely spoken, with English and Hindi used in many visitor settings.",
      food: "Try local fish preparations, singju, eromba, seasonal vegetables, and homestay meals.",
      thingsToDo: ["Boat through phumdis", "Visit Sendra viewpoint", "Explore Keibul Lamjao", "Birdwatching", "Stay with a lake community"],
      nearbyAttractions: ["Keibul Lamjao National Park", "Sendra Island", "Moirang INA Museum"],
      transportation: "Road travel from Imphal to Moirang and Thanga is common. Local boats should be arranged with trusted operators.",
      hotels: [
        { name: "Lake-view stays near Sendra", type: "Hotel" },
        { name: "Guesthouses around Moirang", type: "Guesthouse" },
      ],
      homestays: [
        { name: "Community homestays in Thanga", type: "Homestay" },
      ],
      hiddenGems: ["Sunrise over phumdis", "Local fish markets", "Quiet birding stretches near the lake edge"],
      isFeatured: true,
    },
    {
      name: "Shirui Hills",
      slug: "shirui-hills",
      villageName: "Shirui",
      description: "A misty hill landscape in Ukhrul known for the rare Shirui lily, Tangkhul culture, and highland views.",
      shortDescription: "Highland trails, rare seasonal lilies, Tangkhul hospitality, and cool mountain weather.",
      fullDescription:
        "Shirui Hills offers one of Manipur's most distinctive highland experiences, especially during the blooming season of the rare Shirui lily. The destination combines ecological sensitivity, mountain walking, village hospitality, local food, and cultural learning in the Ukhrul district.",
      state: "Manipur",
      district: "Ukhrul",
      latitude: 25.1085,
      longitude: 94.3619,
      coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
      heroImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
      galleryImages: [
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      ],
      bestSeason: "April to June and October to November",
      openingHours: "Trail access depends on weather, local guidance, and conservation advisories.",
      estimatedDuration: "2 days",
      entryFee: "Local guide, festival, or conservation fees may apply.",
      accessibility: "Hill trails can be steep and slippery. Travelers should prepare for changing weather and basic facilities.",
      safetyInfo: "Use local guides, avoid damaging lily habitats, carry rain protection, and check road conditions before travel.",
      emergencyContacts: [
        { label: "Emergency", value: "112" },
        { label: "Ukhrul Tourist Support", value: "District tourism office" },
      ],
      tags: ["hills", "lily", "trekking", "culture", "photography"],
      categories: ["Nature", "Culture", "Adventure"],
      history: "Shirui is strongly associated with Tangkhul heritage and the conservation story of the rare Shirui lily.",
      culture: "Tangkhul food, music, village life, and hospitality add depth to the mountain experience.",
      religion: "Christian communities are prominent in the region, alongside older cultural memory and community traditions.",
      traditions: "Seasonal festivals, weaving, local food practices, and village gatherings shape the travel rhythm.",
      language: "Tangkhul languages are spoken locally, with Manipuri, English, and Hindi also used.",
      food: "Try local smoked meat, bamboo shoot dishes, hill vegetables, black rice preparations, and village meals.",
      thingsToDo: ["Walk Shirui trails", "Photograph lily blooms responsibly", "Explore Ukhrul town", "Try Tangkhul food", "Visit local viewpoints"],
      nearbyAttractions: ["Ukhrul town", "Khayang Peak", "Kachouphung Lake"],
      transportation: "Road travel from Imphal to Ukhrul and Shirui is common. Build buffer time for hill roads.",
      hotels: [
        { name: "Guesthouses in Ukhrul", type: "Guesthouse" },
      ],
      homestays: [
        { name: "Village homestays in Shirui", type: "Homestay" },
      ],
      hiddenGems: ["Misty morning viewpoints", "Village food stops", "Quiet trail sections away from peak festival crowds"],
      isFeatured: false,
    },
    {
      name: "Dzukou Valley",
      slug: "dzukou-valley",
      villageName: "Viswema",
      description: "A high valley of rolling meadows, seasonal flowers, and trekking routes on the Manipur-Nagaland border.",
      shortDescription: "A cool trekking escape with meadows, flowers, camps, and dramatic valley views.",
      fullDescription:
        "Dzukou Valley is a celebrated trekking landscape known for soft green folds, seasonal blooms, cool weather, and a sense of quiet remoteness. It suits travelers who are ready for basic facilities, responsible camping, local guides, and careful weather planning.",
      state: "Nagaland",
      district: "Kohima",
      latitude: 25.538,
      longitude: 94.071,
      coverImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      heroImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      galleryImages: [
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
      ],
      bestSeason: "June to September for blooms, November to March for clear treks",
      openingHours: "Trail entry depends on route, weather, and local permissions.",
      estimatedDuration: "2 to 3 days",
      entryFee: "Entry, guide, camping, and porter fees vary by route and season.",
      accessibility: "The valley requires trekking and basic stays. It is not suited for travelers with limited mobility.",
      safetyInfo: "Carry warm layers, waterproof gear, sufficient water, and travel with local guides during uncertain weather.",
      emergencyContacts: [
        { label: "Emergency", value: "112" },
        { label: "Local guide support", value: "Arrange before trek" },
      ],
      tags: ["trekking", "valley", "flowers", "camping", "nature"],
      categories: ["Adventure", "Nature", "Photography"],
      history: "The valley has long been connected to local community routes and has become a signature trekking landscape of the region.",
      culture: "Nearby Naga villages contribute guiding, food, route knowledge, and conservation practices.",
      religion: "The surrounding villages include strong Christian community life and local cultural traditions.",
      traditions: "Community route management, village hospitality, and seasonal trekking practices define the experience.",
      language: "Local Naga languages, English, and Hindi are used around route access points.",
      food: "Expect simple trek meals, local rice dishes, smoked meat, seasonal greens, and packed food.",
      thingsToDo: ["Trek to the valley", "Camp responsibly", "Photograph seasonal flowers", "Watch sunrise", "Learn route ecology"],
      nearbyAttractions: ["Kohima", "Jakhama village", "Viswema route viewpoints"],
      transportation: "Road access to Viswema or Jakhama is followed by trekking. Arrange permits and local guide support in advance.",
      hotels: [
        { name: "Hotels in Kohima", type: "Hotel" },
      ],
      homestays: [
        { name: "Village homestays near Viswema", type: "Homestay" },
      ],
      hiddenGems: ["Quiet sunrise ridges", "Flowering pockets after rain", "Village food before the climb"],
      isFeatured: false,
    },
  ];

  const categoryNames = Array.from(new Set(destinationProfiles.flatMap((destination) => destination.categories)));
  const categoryRecords = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({
        where: { slug: slugify(name) },
        update: { name },
        create: {
          name,
          slug: slugify(name),
        },
      })
    )
  );
  const categoriesByName = new Map(categoryRecords.map((category) => [category.name, category]));

  const destinations = [];

  for (const destination of destinationProfiles) {
    const { galleryImages, categories, villageName, state, district, heroImage, fullDescription, description, ...rest } = destination;
    const destinationData = {
      ...rest,
      description: fullDescription ?? description,
      coverImage: rest.coverImage ?? heroImage,
      bestMonths: parseBestMonths(rest.bestSeason),
    };
    const village = await prisma.village.upsert({
      where: {
        name_district: {
          name: villageName,
          district,
        },
      },
      update: {
        state,
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
      create: {
        name: villageName,
        district,
        state,
        latitude: destination.latitude,
        longitude: destination.longitude,
        description: `Tourism service village for ${villageName}.`,
      },
    });

    const savedDestination = await prisma.destination.upsert({
      where: { slug: destination.slug },
      update: {
        ...destinationData,
        villageId: village.id,
      },
      create: {
        ...destinationData,
        villageId: village.id,
      },
    });

    await prisma.destinationPhoto.deleteMany({
      where: {
        destinationId: savedDestination.id,
      },
    });

    if (galleryImages.length) {
      await prisma.destinationPhoto.createMany({
        data: galleryImages.map((imageUrl, index) => ({
          destinationId: savedDestination.id,
          imageUrl,
          isCover: index === 0,
          displayOrder: index,
        })),
      });
    }

    await prisma.destinationCategory.deleteMany({
      where: {
        destinationId: savedDestination.id,
      },
    });

    await prisma.destinationCategory.createMany({
      data: categories.map((categoryName) => ({
        destinationId: savedDestination.id,
        categoryId: categoriesByName.get(categoryName).id,
      })),
      skipDuplicates: true,
    });

    destinations.push(savedDestination);
  }

  const kaziranga = destinations[0];
  const tawang = destinations[1];
  const shillong = destinations[2];

  const experiences = [
    { destinationId: kaziranga.id, title: "Elephant Grassland Safari", description: "A guided safari through the rolling grasslands with wildlife spotting.", category: "WILDLIFE", difficulty: "Moderate", duration: "3 hours", price: 1200 },
    { destinationId: kaziranga.id, title: "Village Heritage Walk", description: "Meet local communities and experience traditional hospitality.", category: "CULTURE", difficulty: "Easy", duration: "2 hours", price: 600 },
    { destinationId: tawang.id, title: "Monastery Trail", description: "Discover sacred architecture and high-altitude traditions.", category: "SPIRITUAL", difficulty: "Moderate", duration: "4 hours", price: 900 },
    { destinationId: shillong.id, title: "Local Food Discovery Tour", description: "Taste regional street food and seasonal market favorites.", category: "FOOD", difficulty: "Easy", duration: "2 hours", price: 700 },
    { destinationId: shillong.id, title: "Cloud-Kissed Nature Walk", description: "Enjoy a scenic walk through pine forests and viewpoints.", category: "NATURE", difficulty: "Easy", duration: "2.5 hours", price: 800 },
  ];

  // Experiences have no natural unique key, so check before inserting to keep the seed re-runnable.
  for (const experience of experiences) {
    const exists = await prisma.experience.findFirst({ where: { destinationId: experience.destinationId, title: experience.title }, select: { id: true } });
    if (!exists) await prisma.experience.create({ data: experience });
  }

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
        startDate: new Date("2027-02-07"),
        endDate: new Date("2027-02-09"),
        description: "A festive celebration featuring rituals, dance, and local cuisine.",
        significance: "Losar marks the Tibetan Buddhist new year. Monasteries hold prayers and masked dances, and families gather to share food and visit relatives.",
        imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200",
        category: "FESTIVAL",
        isFeatured: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.story.createMany({
    data: [
      {
        destinationId: kaziranga.id,
        title: "Guardians of the Grasslands",
        slug: "guardians-of-the-grasslands",
        excerpt: "Local guides share stories of rhinos, riverbanks, and the living landscape of Kaziranga.",
        content: "Local guides share stories of rhinos, riverbanks, and the living landscape of Kaziranga.",
        language: "English",
      },
      {
        destinationId: tawang.id,
        title: "Mountain Monastery Voices",
        slug: "mountain-monastery-voices",
        excerpt: "Monastery elders recount the spiritual history of Tawang and its valleys.",
        content: "Monastery elders recount the spiritual history of Tawang and its valleys.",
        language: "English",
      },
    ],
    skipDuplicates: true,
  });

  await seedPermits();
  await seedSouvenirs(prisma);

  if (demoUsers?.GUIDE) {
    await prisma.guideProfile.upsert({
      where: { userId: demoUsers.GUIDE.id },
      update: {},
      create: {
        userId: demoUsers.GUIDE.id,
        headline: "Wildlife and monastery trails in Assam and Arunachal",
        bio: "I grew up near Kohora and have guided safaris and village walks for a decade. I also lead slow monastery routes around Tawang in the open season.",
        languages: ["English", "Hindi", "Assamese"],
        yearsExperience: 10,
        phone: "+91 90000 00000",
        status: "APPROVED",
        areas: { create: [{ destinationId: kaziranga.id }, { destinationId: tawang.id }] },
      },
    });
  }

  if (demoUsers?.TOURIST) {
    const hasTrip = await prisma.trip.findFirst({ where: { userId: demoUsers.TOURIST.id }, select: { id: true } });

    if (!hasTrip) {
      const experienceId = async (title) => (await prisma.experience.findFirst({ where: { destinationId: kaziranga.id, title }, select: { id: true } }))?.id ?? null;
      const safariId = await experienceId("Elephant Grassland Safari");
      const walkId = await experienceId("Village Heritage Walk");
      await prisma.trip.create({
        data: {
          userId: demoUsers.TOURIST.id,
          destinationId: kaziranga.id,
          title: "Kaziranga long weekend",
          startDate: new Date("2026-12-04"),
          endDate: new Date("2026-12-06"),
          items: {
            create: [
              { day: 1, position: 0, title: "Arrive at Kaziranga", destinationId: kaziranga.id },
              { day: 2, position: 0, time: "6:00 AM", title: "Elephant Grassland Safari", destinationId: kaziranga.id, experienceId: safariId },
              { day: 3, position: 0, title: "Village Heritage Walk", destinationId: kaziranga.id, experienceId: walkId },
            ],
          },
        },
      });
    }
  }
}

/**
 * Baseline entry rules. Only the well-known "who needs an Inner Line Permit" facts are seeded;
 * portals, fees and processing times must be added and verified by an admin.
 * Existing rows are never overwritten.
 */
async function seedPermits() {
  const ilp = {
    required: true,
    permitName: "Inner Line Permit (ILP)",
    whoNeedsIt: "Indian citizens from outside the state. Foreign nationals need a Protected Area Permit (PAP) instead.",
    howToApply: "Apply through the state government's official ILP portal or at designated counters before you travel. Carry printed and digital copies with your ID.",
  };
  const permits = [
    { state: "Arunachal Pradesh", ...ilp },
    { state: "Nagaland", ...ilp },
    { state: "Mizoram", ...ilp },
    { state: "Manipur", ...ilp },
    { state: "Assam", required: false, whoNeedsIt: "No entry permit is needed to visit Assam." },
    { state: "Meghalaya", required: false, whoNeedsIt: "No entry permit is currently needed to visit Meghalaya." },
    { state: "Tripura", required: false, whoNeedsIt: "No entry permit is needed to visit Tripura." },
    {
      state: "Sikkim",
      required: false,
      whoNeedsIt: "No permit is needed to enter Sikkim, but protected areas such as parts of North and East Sikkim need a special permit. Foreign nationals need a Restricted Area Permit.",
    },
  ];

  for (const permit of permits) {
    await prisma.statePermit.upsert({ where: { state: permit.state }, update: {}, create: permit });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
