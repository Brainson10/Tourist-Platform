#!/usr/bin/env node
/**
 * Adds the "Take Home a Memory" starter content to an existing database without touching
 * anything already there (see prisma/seed-souvenirs.js). Safe to re-run.
 *
 *   node scripts/seed-souvenirs.mjs
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { seedSouvenirs } from "../prisma/seed-souvenirs.js";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

try {
  await seedSouvenirs(prisma);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
