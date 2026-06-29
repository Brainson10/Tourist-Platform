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

  const destinations = await Promise.all([
    prisma.destination.upsert({
      where: { slug: "kaziranga" },
      update: {},
      create: {
        name: "Kaziranga National Park",
        slug: "kaziranga",
        description: "A UNESCO World Heritage site famed for one-horned rhinoceros and lush grasslands.",
        state: "Assam",
        district: "Golaghat",
        latitude: 26.57,
        longitude: 93.17,
        coverImage: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2",
      },
    }),
    prisma.destination.upsert({
      where: { slug: "tawang" },
      update: {},
      create: {
        name: "Tawang",
        slug: "tawang",
        description: "A high-altitude town known for monasteries, valleys, and scenic mountain roads.",
        state: "Arunachal Pradesh",
        district: "Tawang",
        latitude: 27.59,
        longitude: 91.86,
        coverImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      },
    }),
    prisma.destination.upsert({
      where: { slug: "shillong" },
      update: {},
      create: {
        name: "Shillong",
        slug: "shillong",
        description: "The misty hill station of Meghalaya known for lakes, gardens, and local culture.",
        state: "Meghalaya",
        district: "East Khasi Hills",
        latitude: 25.57,
        longitude: 91.88,
        coverImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      },
    }),
  ]);

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
        startDate: new Date("2026-11-20"),
        endDate: new Date("2026-11-22"),
        description: "A cultural celebration with music, crafts, and wildlife awareness events.",
      },
      {
        destinationId: tawang.id,
        title: "Tawang Losar",
        startDate: new Date("2026-02-10"),
        endDate: new Date("2026-02-12"),
        description: "A festive celebration featuring rituals, dance, and local cuisine.",
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
