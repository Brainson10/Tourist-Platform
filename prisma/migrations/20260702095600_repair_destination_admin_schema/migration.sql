-- Repair destination-admin schema drift from the incomplete destination_module_v1 migration.
-- This migration preserves legacy gallery/category arrays when they exist.

-- CreateTable
CREATE TABLE IF NOT EXISTS "Village" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT,
    "description" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DestinationCategory" (
    "destinationId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "DestinationCategory_pkey" PRIMARY KEY ("destinationId","categoryId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DestinationPhoto" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DestinationPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- Add a fallback village for legacy destinations created before village intelligence existed.
INSERT INTO "Village" ("id", "name", "district", "state", "description", "latitude", "longitude", "updatedAt")
VALUES (
    'legacy-village',
    'Unassigned Village',
    'Unknown',
    'Unknown',
    'Fallback village for destination records created before the village module was introduced.',
    0,
    0,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- AlterTable
ALTER TABLE "Destination" ADD COLUMN IF NOT EXISTS "villageId" TEXT;

UPDATE "Destination"
SET "villageId" = 'legacy-village'
WHERE "villageId" IS NULL;

ALTER TABLE "Destination" ALTER COLUMN "villageId" SET NOT NULL;

-- Preserve legacy category array data in normalized category tables.
WITH legacy_categories AS (
    SELECT DISTINCT
        trim(category_name) AS name,
        lower(regexp_replace(trim(category_name), '[^a-zA-Z0-9]+', '-', 'g')) AS slug
    FROM "Destination", unnest(COALESCE("categories", ARRAY[]::TEXT[])) AS category_name
    WHERE trim(category_name) <> ''
),
normalized_categories AS (
    SELECT
        'category-' || slug AS id,
        min(name) AS name,
        slug
    FROM legacy_categories
    GROUP BY slug
)
INSERT INTO "Category" ("id", "name", "slug", "updatedAt")
SELECT id, name, slug, CURRENT_TIMESTAMP
FROM normalized_categories
ON CONFLICT DO NOTHING;

INSERT INTO "DestinationCategory" ("destinationId", "categoryId")
SELECT DISTINCT
    destination."id",
    category."id"
FROM "Destination" AS destination
CROSS JOIN LATERAL unnest(COALESCE(destination."categories", ARRAY[]::TEXT[])) AS category_name
JOIN "Category" AS category
    ON category."slug" = lower(regexp_replace(trim(category_name), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE trim(category_name) <> ''
ON CONFLICT DO NOTHING;

-- Preserve legacy gallery image array data in the normalized photo table.
INSERT INTO "DestinationPhoto" ("id", "destinationId", "imageUrl", "isCover", "displayOrder")
SELECT
    destination."id" || '-photo-' || gallery.ordinality,
    destination."id",
    gallery.image_url,
    gallery.ordinality = 1,
    gallery.ordinality - 1
FROM "Destination" AS destination
CROSS JOIN LATERAL unnest(COALESCE(destination."galleryImages", ARRAY[]::TEXT[])) WITH ORDINALITY AS gallery(image_url, ordinality)
WHERE trim(gallery.image_url) <> ''
ON CONFLICT DO NOTHING;

-- Drop legacy denormalized columns after data has been migrated.
ALTER TABLE "Destination" DROP COLUMN IF EXISTS "categories";
ALTER TABLE "Destination" DROP COLUMN IF EXISTS "galleryImages";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Village_district_idx" ON "Village"("district");
CREATE INDEX IF NOT EXISTS "Village_state_idx" ON "Village"("state");
CREATE UNIQUE INDEX IF NOT EXISTS "Village_name_district_key" ON "Village"("name", "district");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");
CREATE INDEX IF NOT EXISTS "DestinationCategory_categoryId_idx" ON "DestinationCategory"("categoryId");
CREATE INDEX IF NOT EXISTS "DestinationPhoto_destinationId_idx" ON "DestinationPhoto"("destinationId");
CREATE INDEX IF NOT EXISTS "DestinationPhoto_displayOrder_idx" ON "DestinationPhoto"("displayOrder");
CREATE INDEX IF NOT EXISTS "Review_destinationId_idx" ON "Review"("destinationId");
CREATE INDEX IF NOT EXISTS "Review_userId_idx" ON "Review"("userId");
CREATE INDEX IF NOT EXISTS "Review_rating_idx" ON "Review"("rating");

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DestinationCategory" ADD CONSTRAINT "DestinationCategory_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DestinationCategory" ADD CONSTRAINT "DestinationCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DestinationPhoto" ADD CONSTRAINT "DestinationPhoto_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
