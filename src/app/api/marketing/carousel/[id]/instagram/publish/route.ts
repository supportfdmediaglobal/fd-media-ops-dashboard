import { NextResponse } from "next/server";
import { InstagramPublishStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { resolveInstagramCredentials } from "@/lib/marketing/instagramConfig";
import { publishInstagramCarousel } from "@/lib/marketing/instagramGraph";

export const dynamic = "force-dynamic";

export async function POST(
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

  if (carousel.instagramPublishStatus === InstagramPublishStatus.PUBLISHED) {
    return NextResponse.json(
      { error: "Este carrusel ya fue publicado." },
      { status: 400 }
    );
  }

  if (
    carousel.instagramPublishStatus !== InstagramPublishStatus.APPROVED &&
    carousel.instagramPublishStatus !== InstagramPublishStatus.PUBLISH_FAILED
  ) {
    return NextResponse.json(
      {
        error:
          "Solo se puede publicar cuando el estado es «Aprobada» o tras un error de publicación.",
      },
      { status: 400 }
    );
  }

  if (!carousel.imagesGeneratedAt) {
    return NextResponse.json(
      { error: "Primero genera y descarga las imágenes." },
      { status: 400 }
    );
  }

  const cred = await resolveInstagramCredentials();
  if (!cred) {
    return NextResponse.json(
      {
        error:
          "Configura el ID de cuenta de Instagram y el token de acceso (página o formulario de esta pantalla, o variables INSTAGRAM_BUSINESS_ACCOUNT_ID / INSTAGRAM_ACCESS_TOKEN).",
      },
      { status: 400 }
    );
  }

  try {
    const { mediaId } = await publishInstagramCarousel({
      igUserId: cred.businessAccountId,
      accessToken: cred.accessToken,
      carouselId: carousel.id,
      slides: carousel.slides,
    });

    await prisma.marketingCarousel.update({
      where: { id },
      data: {
        instagramPublishStatus: InstagramPublishStatus.PUBLISHED,
        publishedAt: new Date(),
        instagramMediaId: mediaId,
        instagramPublishError: null,
      },
    });

    return NextResponse.json({ ok: true, instagramMediaId: mediaId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    await prisma.marketingCarousel.update({
      where: { id },
      data: {
        instagramPublishStatus: InstagramPublishStatus.PUBLISH_FAILED,
        instagramPublishError: message,
      },
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
