-- Heritage features (additive only; no existing data is changed)
--  * Destination.bestMonths — best months to visit (1–12). Existing rows are
--    back-filled from the free-text bestSeason by scripts/backfill-best-months.mjs.
--  * StatePermit — entry permit rules per state (e.g. Inner Line Permit).
--  * Trip budget/travellers/share link, trip packing checklist.
--  * Review photos.
--  * Local guides: profiles, areas they cover, and tourist requests.

-- CreateEnum
CREATE TYPE "GuideStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "GuideRequestStatus" AS ENUM ('NEW', 'ACCEPTED', 'DECLINED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Destination" ADD COLUMN     "bestMonths" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "dailyBudget" INTEGER,
ADD COLUMN     "shareToken" TEXT,
ADD COLUMN     "travelers" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "ReviewPhoto" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripChecklistItem" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatePermit" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "permitName" TEXT,
    "whoNeedsIt" TEXT,
    "howToApply" TEXT,
    "applyUrl" TEXT,
    "fee" TEXT,
    "processingTime" TEXT,
    "foreignersNote" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatePermit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "phone" TEXT,
    "photoUrl" TEXT,
    "status" "GuideStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuideProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideArea" (
    "guideId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,

    CONSTRAINT "GuideArea_pkey" PRIMARY KEY ("guideId","destinationId")
);

-- CreateTable
CREATE TABLE "GuideRequest" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "touristId" TEXT NOT NULL,
    "destinationId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "groupSize" INTEGER NOT NULL DEFAULT 1,
    "message" TEXT NOT NULL,
    "status" "GuideRequestStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuideRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewPhoto_reviewId_position_idx" ON "ReviewPhoto"("reviewId", "position");

-- CreateIndex
CREATE INDEX "TripChecklistItem_tripId_position_idx" ON "TripChecklistItem"("tripId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "StatePermit_state_key" ON "StatePermit"("state");

-- CreateIndex
CREATE UNIQUE INDEX "GuideProfile_userId_key" ON "GuideProfile"("userId");

-- CreateIndex
CREATE INDEX "GuideProfile_status_idx" ON "GuideProfile"("status");

-- CreateIndex
CREATE INDEX "GuideArea_destinationId_idx" ON "GuideArea"("destinationId");

-- CreateIndex
CREATE INDEX "GuideRequest_guideId_status_idx" ON "GuideRequest"("guideId", "status");

-- CreateIndex
CREATE INDEX "GuideRequest_touristId_idx" ON "GuideRequest"("touristId");

-- CreateIndex
CREATE INDEX "GuideRequest_destinationId_idx" ON "GuideRequest"("destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_shareToken_key" ON "Trip"("shareToken");

-- AddForeignKey
ALTER TABLE "ReviewPhoto" ADD CONSTRAINT "ReviewPhoto_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripChecklistItem" ADD CONSTRAINT "TripChecklistItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideProfile" ADD CONSTRAINT "GuideProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideArea" ADD CONSTRAINT "GuideArea_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "GuideProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideArea" ADD CONSTRAINT "GuideArea_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideRequest" ADD CONSTRAINT "GuideRequest_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "GuideProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideRequest" ADD CONSTRAINT "GuideRequest_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideRequest" ADD CONSTRAINT "GuideRequest_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Guard rails the application also validates.
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_bestMonths_range" CHECK ("bestMonths" <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]);
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_travelers_positive" CHECK ("travelers" >= 1);
ALTER TABLE "GuideRequest" ADD CONSTRAINT "GuideRequest_groupSize_positive" CHECK ("groupSize" >= 1);
