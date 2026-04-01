import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatCarouselTxt } from "@/lib/marketing/formatExport";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const carousel = await prisma.marketingCarousel.findUnique({
    where: { id },
    include: { slides: { orderBy: { order: "asc" } } },
  });
  if (!carousel) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const forLabel = carousel.forDate.toISOString().slice(0, 10);
  const text = formatCarouselTxt(carousel.slides, forLabel);
  const safeName = `fdbienestar-carrusel-${forLabel}.txt`;

  return new NextResponse(text, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}"`,
    },
  });
}
