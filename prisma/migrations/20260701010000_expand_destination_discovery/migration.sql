-- AlterTable
ALTER TABLE "Destination" ADD COLUMN "shortDescription" TEXT;
ALTER TABLE "Destination" ADD COLUMN "fullDescription" TEXT;
ALTER TABLE "Destination" ADD COLUMN "heroImage" TEXT;
ALTER TABLE "Destination" ADD COLUMN "galleryImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Destination" ADD COLUMN "bestSeason" TEXT;
ALTER TABLE "Destination" ADD COLUMN "openingHours" TEXT;
ALTER TABLE "Destination" ADD COLUMN "estimatedDuration" TEXT;
ALTER TABLE "Destination" ADD COLUMN "entryFee" TEXT;
ALTER TABLE "Destination" ADD COLUMN "accessibility" TEXT;
ALTER TABLE "Destination" ADD COLUMN "safetyInfo" TEXT;
ALTER TABLE "Destination" ADD COLUMN "emergencyContacts" JSONB;
ALTER TABLE "Destination" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Destination" ADD COLUMN "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Destination" ADD COLUMN "history" TEXT;
ALTER TABLE "Destination" ADD COLUMN "culture" TEXT;
ALTER TABLE "Destination" ADD COLUMN "religion" TEXT;
ALTER TABLE "Destination" ADD COLUMN "traditions" TEXT;
ALTER TABLE "Destination" ADD COLUMN "language" TEXT;
ALTER TABLE "Destination" ADD COLUMN "food" TEXT;
ALTER TABLE "Destination" ADD COLUMN "thingsToDo" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Destination" ADD COLUMN "nearbyAttractions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Destination" ADD COLUMN "transportation" TEXT;
ALTER TABLE "Destination" ADD COLUMN "hotels" JSONB;
ALTER TABLE "Destination" ADD COLUMN "homestays" JSONB;
ALTER TABLE "Destination" ADD COLUMN "hiddenGems" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Destination" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Destination"
SET
  "shortDescription" = "description",
  "fullDescription" = "description",
  "heroImage" = "coverImage"
WHERE "shortDescription" IS NULL;

-- CreateIndex
CREATE INDEX "Destination_isFeatured_idx" ON "Destination"("isFeatured");
