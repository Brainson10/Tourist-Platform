-- Platform overhaul
--  * Better Auth tables (Session, Account, Verification). Existing bcrypt
--    password hashes move from "User"."passwordHash" into credential accounts.
--  * GOVERNMENT role removed (tourist-first platform).
--  * Destination location is derived from its village; duplicated
--    state/district, fullDescription and heroImage are merged then dropped.
--  * Reviews: one per user per destination; cached rating on destinations.
--  * Saved destinations, trip destination + itinerary items.
--  * Stories get slugs/cover/excerpt; festival dates and images optional.
--  * Unused Recommendation table removed (recommendations are rule-based).

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
UPDATE "User" SET "role" = 'TOURIST' WHERE "role"::text = 'GOVERNMENT';

CREATE TYPE "UserRole_new" AS ENUM ('TOURIST', 'GUIDE', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'TOURIST';

-- ---------------------------------------------------------------------------
-- Better Auth
-- ---------------------------------------------------------------------------
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Account" ("id", "userId", "accountId", "providerId", "password", "createdAt", "updatedAt")
SELECT 'acc_' || "id", "id", "id", 'credential', "passwordHash", "createdAt", CURRENT_TIMESTAMP
FROM "User"
WHERE "passwordHash" IS NOT NULL AND "passwordHash" <> '';

ALTER TABLE "User" DROP COLUMN "passwordHash",
ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;

DROP INDEX IF EXISTS "User_email_idx";

CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Destinations
-- ---------------------------------------------------------------------------
UPDATE "Destination"
SET "description" = COALESCE(NULLIF("fullDescription", ''), "description"),
    "shortDescription" = COALESCE(NULLIF("shortDescription", ''), LEFT("description", 220)),
    "coverImage" = COALESCE(NULLIF("coverImage", ''), NULLIF("heroImage", ''));

DROP INDEX IF EXISTS "Destination_district_idx";
DROP INDEX IF EXISTS "Destination_state_idx";

ALTER TABLE "Destination" DROP COLUMN "district",
DROP COLUMN "fullDescription",
DROP COLUMN "heroImage",
DROP COLUMN "state",
ADD COLUMN "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "shortDescription" SET NOT NULL;

CREATE INDEX "Destination_villageId_idx" ON "Destination"("villageId");
CREATE INDEX "Destination_ratingAverage_idx" ON "Destination"("ratingAverage");

DROP INDEX IF EXISTS "DestinationPhoto_destinationId_idx";
DROP INDEX IF EXISTS "DestinationPhoto_displayOrder_idx";
CREATE INDEX "DestinationPhoto_destinationId_displayOrder_idx" ON "DestinationPhoto"("destinationId", "displayOrder");

-- Placeholder village left behind by an earlier repair migration.
DELETE FROM "Village" v
WHERE v."name" = 'Unassigned Village'
  AND NOT EXISTS (SELECT 1 FROM "Destination" d WHERE d."villageId" = v."id");

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
-- Keep only the newest review per user and destination before enforcing uniqueness.
DELETE FROM "Review" r
USING "Review" newer
WHERE r."destinationId" = newer."destinationId"
  AND r."userId" = newer."userId"
  AND (r."createdAt", r."id") < (newer."createdAt", newer."id");

UPDATE "Review" SET "rating" = LEAST(5, GREATEST(1, "rating"));

DROP INDEX IF EXISTS "Review_destinationId_idx";
DROP INDEX IF EXISTS "Review_rating_idx";
CREATE UNIQUE INDEX "Review_destinationId_userId_key" ON "Review"("destinationId", "userId");
CREATE INDEX "Review_destinationId_status_idx" ON "Review"("destinationId", "status");
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_range" CHECK ("rating" BETWEEN 1 AND 5);

UPDATE "Destination" d
SET "ratingAverage" = COALESCE(s.avg, 0), "reviewCount" = COALESCE(s.cnt, 0)
FROM (
  SELECT "destinationId", AVG("rating")::double precision AS avg, COUNT(*)::int AS cnt
  FROM "Review" WHERE "status" = 'APPROVED' GROUP BY "destinationId"
) s
WHERE s."destinationId" = d."id";

-- ---------------------------------------------------------------------------
-- Saved destinations
-- ---------------------------------------------------------------------------
CREATE TABLE "SavedDestination" (
    "userId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedDestination_pkey" PRIMARY KEY ("userId","destinationId")
);
CREATE INDEX "SavedDestination_destinationId_idx" ON "SavedDestination"("destinationId");
ALTER TABLE "SavedDestination" ADD CONSTRAINT "SavedDestination_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedDestination" ADD CONSTRAINT "SavedDestination_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Experiences, festivals, stories
-- ---------------------------------------------------------------------------
ALTER TABLE "Experience" ADD COLUMN "imageUrl" TEXT,
ALTER COLUMN "difficulty" DROP NOT NULL,
ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "price" DROP NOT NULL;

ALTER TABLE "Festival" ADD COLUMN "significance" TEXT,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "imageUrl" DROP NOT NULL,
ALTER COLUMN "category" SET DEFAULT 'FESTIVAL';

ALTER TABLE "Story" ADD COLUMN "authorName" TEXT,
ADD COLUMN "coverImage" TEXT,
ADD COLUMN "excerpt" TEXT,
ADD COLUMN "slug" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "language" SET DEFAULT 'English';

UPDATE "Story"
SET "slug" = TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER("title"), '[^a-z0-9]+', '-', 'g')) || '-' || RIGHT("id", 6);

ALTER TABLE "Story" ALTER COLUMN "slug" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

DROP INDEX IF EXISTS "Story_title_idx";
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");
CREATE INDEX "Story_createdAt_idx" ON "Story"("createdAt");

-- ---------------------------------------------------------------------------
-- Trips and itinerary
-- ---------------------------------------------------------------------------
ALTER TABLE "Trip" ADD COLUMN "destinationId" TEXT,
ADD COLUMN "notes" TEXT;

DROP INDEX IF EXISTS "Trip_userId_idx";
CREATE INDEX "Trip_userId_startDate_idx" ON "Trip"("userId", "startDate");
CREATE INDEX "Trip_destinationId_idx" ON "Trip"("destinationId");
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "TripItem" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "time" TEXT,
    "destinationId" TEXT,
    "experienceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TripItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TripItem_tripId_day_position_idx" ON "TripItem"("tripId", "day", "position");
CREATE INDEX "TripItem_destinationId_idx" ON "TripItem"("destinationId");
CREATE INDEX "TripItem_experienceId_idx" ON "TripItem"("experienceId");
ALTER TABLE "TripItem" ADD CONSTRAINT "TripItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TripItem" ADD CONSTRAINT "TripItem_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TripItem" ADD CONSTRAINT "TripItem_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Cleanup
-- ---------------------------------------------------------------------------
DROP TABLE "Recommendation";
DROP INDEX IF EXISTS "PlatformSetting_key_idx";
