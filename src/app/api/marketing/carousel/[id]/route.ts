import { NextResponse } from "next/server";
import { InstagramPublishStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

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
  return NextResponse.json({ carousel });
}

/** Aprobar carrusel para publicación en Instagram (solo desde pendiente). */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { action?: string };

  if (body.action !== "approve" && body.action !== "approve_phrase") {
    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  }

  const carousel = await prisma.marketingCarousel.findUnique({ where: { id } });
  if (!carousel) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (body.action === "approve") {
    if (
      carousel.instagramPublishStatus !== InstagramPublishStatus.PENDING_APPROVAL
    ) {
      return NextResponse.json(
        {
          error:
            "Solo se puede aprobar cuando el estado es «Pendiente por publicar».",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.marketingCarousel.update({
      where: { id },
      data: {
        instagramPublishStatus: InstagramPublishStatus.APPROVED,
        approvedAt: new Date(),
      },
      include: { slides: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ ok: true, carousel: updated });
  }

  // approve_phrase
  if (carousel.phrasePublishStatus !== InstagramPublishStatus.PENDING_APPROVAL) {
    return NextResponse.json(
      {
        error:
          "Solo se puede aprobar la imagen cuando el estado es «Pendiente por publicar».",
      },
      { status: 400 }
    );
  }

  const updated = await prisma.marketingCarousel.update({
    where: { id },
    data: {
      phrasePublishStatus: InstagramPublishStatus.APPROVED,
      phraseApprovedAt: new Date(),
    },
    include: { slides: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ ok: true, carousel: updated });
}
