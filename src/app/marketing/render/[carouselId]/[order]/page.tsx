import { prisma } from "@/lib/db";
import { MarketingSlideCanvas } from "@/components/marketing/render/MarketingSlideCanvas";

export const dynamic = "force-dynamic";

export default async function RenderSlidePage({
  params,
}: {
  params: Promise<{ carouselId: string; order: string }>;
}) {
  const { carouselId, order } = await params;
  const ord = Number(order);
  const carousel = await prisma.marketingCarousel.findUnique({
    where: { id: carouselId },
    include: { slides: { orderBy: { order: "asc" } } },
  });

  const slide = carousel?.slides.find((s) => s.order === ord);
  if (!carousel || !slide) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui, -apple-system, Segoe UI, Arial" }}>
        No encontrado
      </div>
    );
  }

  return (
    <MarketingSlideCanvas
      forDateISO={carousel.forDate.toISOString()}
      slide={{
        pillar: slide.pillar,
        headline: slide.headline,
        body: slide.body,
        hashtags: slide.hashtags,
      }}
    />
  );
}
