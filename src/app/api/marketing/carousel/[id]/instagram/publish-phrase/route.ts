import { NextResponse } from "next/server";
import { InstagramPublishStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { resolveInstagramCredentials } from "@/lib/marketing/instagramConfig";
import { getBaseUrl } from "@/lib/marketing/imageGen";
import { publishInstagramImage } from "@/lib/marketing/instagramGraph";

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

  if (carousel.phrasePublishStatus === InstagramPublishStatus.PUBLISHED) {
    return NextResponse.json(
      { error: "Esta imagen ya fue publicada." },
      { status: 400 }
    );
  }

  if (
    carousel.phrasePublishStatus !== InstagramPublishStatus.APPROVED &&
    carousel.phrasePublishStatus !== InstagramPublishStatus.PUBLISH_FAILED
  ) {
    return NextResponse.json(
      {
        error:
          "Solo se puede publicar cuando el estado es «Aprobada» o tras un error de publicación.",
      },
      { status: 400 }
    );
  }

  if (!carousel.phraseGeneratedAt) {
    return NextResponse.json(
      { error: "Primero genera la imagen." },
      { status: 400 }
    );
  }

  const cred = await resolveInstagramCredentials();
  if (!cred) {
    return NextResponse.json(
      {
        error:
          "Configura el ID de cuenta de Instagram y el token de acceso (pantalla o variables INSTAGRAM_BUSINESS_ACCOUNT_ID / INSTAGRAM_ACCESS_TOKEN).",
      },
      { status: 400 }
    );
  }

  const base = getBaseUrl().replace(/\/+$/, "");
  const imageUrl = `${base}/generated/marketing/${id}/frase-del-dia.png`;

  try {
    const { mediaId } = await publishInstagramImage({
      igUserId: cred.businessAccountId,
      accessToken: cred.accessToken,
      imageUrl,
    });

    await prisma.marketingCarousel.update({
      where: { id },
      data: {
        phrasePublishStatus: InstagramPublishStatus.PUBLISHED,
        phrasePublishedAt: new Date(),
        phraseInstagramMediaId: mediaId,
        phrasePublishError: null,
      },
    });

    return NextResponse.json({ ok: true, instagramMediaId: mediaId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    await prisma.marketingCarousel.update({
      where: { id },
      data: {
        phrasePublishStatus: InstagramPublishStatus.PUBLISH_FAILED,
        phrasePublishError: message,
      },
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

