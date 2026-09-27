#!/usr/bin/env node
/**
 * Fills Destination.bestMonths from the free-text bestSeason ("November to April").
 * Safe to re-run: only touches destinations whose bestMonths is still empty.
 *
 *   node scripts/backfill-best-months.mjs          # apply
 *   node scripts/backfill-best-months.mjs --dry    # preview only
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { formatMonthSpans, parseBestMonths } from "../lib/utils/months.js";

const dryRun = process.argv.includes("--dry");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

try {
  const destinations = await prisma.destination.findMany({
    where: { bestMonths: { isEmpty: true }, bestSeason: { not: null } },
    select: { id: true, name: true, bestSeason: true },
  });

  let updated = 0;

  for (const destination of destinations) {
    const months = parseBestMonths(destination.bestSeason);
    console.log(`${months.length ? "✓" : "–"} ${destination.name}: "${destination.bestSeason}" → ${formatMonthSpans(months) || "no months recognised"}`);

    if (months.length && !dryRun) {
      await prisma.destination.update({ where: { id: destination.id }, data: { bestMonths: months } });
      updated += 1;
    }
  }

  console.log(`\n${dryRun ? "Dry run: would update" : "Updated"} ${dryRun ? destinations.filter((d) => parseBestMonths(d.bestSeason).length).length : updated} of ${destinations.length} destinations.`);
} finally {
  await prisma.$disconnect();
}
