-- AlterTable
ALTER TABLE "MarketingCarousel" ADD COLUMN     "phraseApprovedAt" TIMESTAMP(3),
ADD COLUMN     "phraseGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "phraseInstagramMediaId" TEXT,
ADD COLUMN     "phrasePublishError" TEXT,
ADD COLUMN     "phrasePublishStatus" "InstagramPublishStatus" NOT NULL DEFAULT 'NOT_GENERATED',
ADD COLUMN     "phrasePublishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MarketingRotationState" ALTER COLUMN "id" SET DEFAULT 'default',
ALTER COLUMN "updatedAt" DROP DEFAULT;
