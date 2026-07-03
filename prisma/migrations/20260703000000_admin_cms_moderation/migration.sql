-- Add moderation and account-control state required by the Tourism CMS.

DO $$ BEGIN
    CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'HIDDEN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isBlocked" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING';

CREATE INDEX IF NOT EXISTS "Review_status_idx" ON "Review"("status");

CREATE TABLE IF NOT EXISTS "PlatformSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PlatformSetting_key_key" ON "PlatformSetting"("key");
CREATE INDEX IF NOT EXISTS "PlatformSetting_key_idx" ON "PlatformSetting"("key");
