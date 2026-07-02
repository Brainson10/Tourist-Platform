-- AlterTable
ALTER TABLE "Festival" ADD COLUMN "slug" TEXT;
ALTER TABLE "Festival" ADD COLUMN "imageUrl" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200';
ALTER TABLE "Festival" ADD COLUMN "category" "ExperienceCategory" NOT NULL DEFAULT 'FESTIVAL';
ALTER TABLE "Festival" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Festival" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Festival"
SET "slug" = lower(regexp_replace("title", '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring("id" from 1 for 8)
WHERE "slug" IS NULL;

ALTER TABLE "Festival" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Festival_slug_key" ON "Festival"("slug");
CREATE INDEX "Festival_category_idx" ON "Festival"("category");
CREATE INDEX "Festival_isFeatured_idx" ON "Festival"("isFeatured");
