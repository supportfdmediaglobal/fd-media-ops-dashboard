-- CreateEnum
CREATE TYPE "ContentPillar" AS ENUM ('COVER', 'EMOTIONAL', 'FINANCIAL', 'NUTRITION', 'CLOSING');

-- CreateTable
CREATE TABLE "MarketingCarousel" (
    "id" TEXT NOT NULL,
    "forDate" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingCarousel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingSlide" (
    "id" TEXT NOT NULL,
    "carouselId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "pillar" "ContentPillar" NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "hashtags" TEXT,

    CONSTRAINT "MarketingSlide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketingCarousel_forDate_key" ON "MarketingCarousel"("forDate");

-- CreateIndex
CREATE INDEX "MarketingSlide_carouselId_order_idx" ON "MarketingSlide"("carouselId", "order");

-- AddForeignKey
ALTER TABLE "MarketingSlide" ADD CONSTRAINT "MarketingSlide_carouselId_fkey" FOREIGN KEY ("carouselId") REFERENCES "MarketingCarousel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
