import { prisma } from "@/lib/db";
import { MarketingPhraseCanvas } from "@/components/marketing/render/MarketingPhraseCanvas";

export const dynamic = "force-dynamic";

export default async function RenderPhrasePage({
  params,
}: {
  params: Promise<{ carouselId: string }>;
}) {
  const { carouselId } = await params;
  const carousel = await prisma.marketingCarousel.findUnique({
    where: { id: carouselId },
  });

  if (!carousel) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui, -apple-system, Segoe UI, Arial" }}>
        No encontrado
      </div>
    );
  }

  const dateKey = carousel.forDate.toISOString().slice(0, 10);

  return (
    <MarketingPhraseCanvas
      dateKey={dateKey}
      emotionalThemeIndex={carousel.emotionalThemeIndex}
      financialThemeIndex={carousel.financialThemeIndex}
      nutritionThemeIndex={carousel.nutritionThemeIndex}
    />
  );
}
