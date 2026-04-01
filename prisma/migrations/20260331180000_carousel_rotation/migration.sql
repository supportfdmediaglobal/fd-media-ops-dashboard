-- AlterTable
ALTER TABLE "MarketingCarousel" ADD COLUMN "emotionalThemeIndex" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "MarketingCarousel" ADD COLUMN "financialThemeIndex" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "MarketingCarousel" ADD COLUMN "nutritionThemeIndex" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "MarketingRotationState" (
    "id" TEXT NOT NULL,
    "emotionalNext" INTEGER NOT NULL DEFAULT 0,
    "financialNext" INTEGER NOT NULL DEFAULT 0,
    "nutritionNext" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingRotationState_pkey" PRIMARY KEY ("id")
);
