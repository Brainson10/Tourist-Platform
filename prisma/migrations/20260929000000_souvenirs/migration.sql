-- "Take Home a Memory" — local souvenirs (additive only; no existing data changes)
--  * SouvenirCategory: souvenir taxonomy, separate from destination interest categories
--  * Souvenir (+ photos), linked to one or more destinations
--  * LocalSeller: where to buy (market, shop, artisan workshop…), located via lat/lng and village

-- CreateEnum
CREATE TYPE "SouvenirAudience" AS ENUM ('MYSELF', 'FAMILY', 'FRIENDS', 'PARTNER', 'CHILDREN', 'PARENTS', 'COLLECTORS');

-- CreateEnum
CREATE TYPE "SouvenirInterest" AS ENUM ('CULTURE', 'FOOD', 'ART', 'FASHION', 'CRAFTS', 'HOME_DECOR', 'UNIQUE');

-- CreateEnum
CREATE TYPE "SouvenirQuality" AS ENUM ('LOCALLY_MADE', 'HANDMADE', 'TRADITIONAL', 'ARTISAN_MADE', 'REGIONAL_SPECIALTY');

-- CreateEnum
CREATE TYPE "SouvenirAvailability" AS ENUM ('YEAR_ROUND', 'SEASONAL', 'FESTIVAL_TIME', 'LIMITED');

-- CreateEnum
CREATE TYPE "SouvenirPhotoKind" AS ENUM ('PRODUCT', 'MAKING', 'MARKET');

-- CreateEnum
CREATE TYPE "SellerKind" AS ENUM ('MARKET', 'SHOP', 'ARTISAN_WORKSHOP', 'HANDICRAFT_CENTER', 'COOPERATIVE', 'OTHER');

-- CreateTable
CREATE TABLE "SouvenirCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SouvenirCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Souvenir" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "whySpecial" TEXT NOT NULL,
    "whyTakeHome" TEXT NOT NULL,
    "authenticityTips" TEXT,
    "carryTips" TEXT,
    "categoryId" TEXT NOT NULL,
    "priceMin" INTEGER,
    "priceMax" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "audiences" "SouvenirAudience"[] DEFAULT ARRAY[]::"SouvenirAudience"[],
    "interests" "SouvenirInterest"[] DEFAULT ARRAY[]::"SouvenirInterest"[],
    "qualities" "SouvenirQuality"[] DEFAULT ARRAY[]::"SouvenirQuality"[],
    "availability" "SouvenirAvailability" NOT NULL DEFAULT 'YEAR_ROUND',
    "availabilityNote" TEXT,
    "coverImage" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "needsVerification" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Souvenir_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SouvenirDestination" (
    "souvenirId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,

    CONSTRAINT "SouvenirDestination_pkey" PRIMARY KEY ("souvenirId","destinationId")
);

-- CreateTable
CREATE TABLE "SouvenirPhoto" (
    "id" TEXT NOT NULL,
    "souvenirId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "kind" "SouvenirPhotoKind" NOT NULL DEFAULT 'PRODUCT',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SouvenirPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalSeller" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "SellerKind" NOT NULL DEFAULT 'MARKET',
    "description" TEXT,
    "address" TEXT,
    "villageId" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "openingHours" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalSeller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SouvenirSeller" (
    "souvenirId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "SouvenirSeller_pkey" PRIMARY KEY ("souvenirId","sellerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "SouvenirCategory_name_key" ON "SouvenirCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SouvenirCategory_slug_key" ON "SouvenirCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Souvenir_slug_key" ON "Souvenir"("slug");

-- CreateIndex
CREATE INDEX "Souvenir_categoryId_idx" ON "Souvenir"("categoryId");

-- CreateIndex
CREATE INDEX "Souvenir_isPublished_isFeatured_idx" ON "Souvenir"("isPublished", "isFeatured");

-- CreateIndex
CREATE INDEX "SouvenirDestination_destinationId_idx" ON "SouvenirDestination"("destinationId");

-- CreateIndex
CREATE INDEX "SouvenirPhoto_souvenirId_position_idx" ON "SouvenirPhoto"("souvenirId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "LocalSeller_slug_key" ON "LocalSeller"("slug");

-- CreateIndex
CREATE INDEX "LocalSeller_villageId_idx" ON "LocalSeller"("villageId");

-- CreateIndex
CREATE INDEX "SouvenirSeller_sellerId_idx" ON "SouvenirSeller"("sellerId");

-- AddForeignKey
ALTER TABLE "Souvenir" ADD CONSTRAINT "Souvenir_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SouvenirCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SouvenirDestination" ADD CONSTRAINT "SouvenirDestination_souvenirId_fkey" FOREIGN KEY ("souvenirId") REFERENCES "Souvenir"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SouvenirDestination" ADD CONSTRAINT "SouvenirDestination_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SouvenirPhoto" ADD CONSTRAINT "SouvenirPhoto_souvenirId_fkey" FOREIGN KEY ("souvenirId") REFERENCES "Souvenir"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalSeller" ADD CONSTRAINT "LocalSeller_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SouvenirSeller" ADD CONSTRAINT "SouvenirSeller_souvenirId_fkey" FOREIGN KEY ("souvenirId") REFERENCES "Souvenir"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SouvenirSeller" ADD CONSTRAINT "SouvenirSeller_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "LocalSeller"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Guard rails the application also validates.
ALTER TABLE "Souvenir" ADD CONSTRAINT "Souvenir_price_non_negative" CHECK (("priceMin" IS NULL OR "priceMin" >= 0) AND ("priceMax" IS NULL OR "priceMax" >= 0));
ALTER TABLE "Souvenir" ADD CONSTRAINT "Souvenir_price_order" CHECK ("priceMin" IS NULL OR "priceMax" IS NULL OR "priceMax" >= "priceMin");
