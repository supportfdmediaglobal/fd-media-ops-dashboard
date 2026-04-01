-- CreateEnum
CREATE TYPE "InstagramPublishStatus" AS ENUM ('NOT_GENERATED', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'PUBLISH_FAILED');

-- AlterTable
ALTER TABLE "MarketingCarousel" ADD COLUMN "instagramPublishStatus" "InstagramPublishStatus" NOT NULL DEFAULT 'NOT_GENERATED';
ALTER TABLE "MarketingCarousel" ADD COLUMN "imagesGeneratedAt" TIMESTAMP(3);
ALTER TABLE "MarketingCarousel" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "MarketingCarousel" ADD COLUMN "publishedAt" TIMESTAMP(3);
ALTER TABLE "MarketingCarousel" ADD COLUMN "instagramMediaId" TEXT;
ALTER TABLE "MarketingCarousel" ADD COLUMN "instagramPublishError" TEXT;

-- CreateTable
CREATE TABLE "MarketingInstagramConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "businessAccountId" TEXT,
    "accessToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingInstagramConfig_pkey" PRIMARY KEY ("id")
);
