import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ContentPillar } from "@prisma/client";
import {
  EMOTIONAL_MODULES,
  FINANCIAL_MODULES,
  NUTRITION_MODULES,
  generateCarouselSlidesFromIndices,
} from "@/lib/marketing/carouselContent";

function parseDateKey(input: string | undefined): string | null {
  if (!input) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  return input;
}

function dateFromKey(key: string): Date {
  return new Date(`${key}T12:00:00.000Z`);
}

/** Listar últimos carruseles (más reciente primero). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "30") || 30, 100);

  const rows = await prisma.marketingCarousel.findMany({
    orderBy: { forDate: "desc" },
    take: limit,
    include: {
      _count: { select: { slides: true } },
    },
  });

  return NextResponse.json({
    carousels: rows.map((c) => ({
      id: c.id,
      forDate: c.forDate.toISOString().slice(0, 10),
      title: c.title,
      slideCount: c._count.slides,
      updatedAt: c.updatedAt.toISOString(),
      instagramPublishStatus: c.instagramPublishStatus,
    })),
  });
}

/** Generar o regenerar carrusel: rotación secuencial por pilar (sin repetir hasta cerrar el ciclo). */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    forDate?: string;
  };

  const key =
    parseDateKey(body.forDate) ??
    new Date().toISOString().slice(0, 10);

  const forDate = dateFromKey(key);
  const title = `Carrusel FD Bienestar · ${key}`;

  const emoLen = EMOTIONAL_MODULES.length;
  const finLen = FINANCIAL_MODULES.length;
  const nutLen = NUTRITION_MODULES.length;

  const pillarMap: Record<
    ReturnType<typeof generateCarouselSlidesFromIndices>[number]["pillar"],
    ContentPillar
  > = {
    COVER: ContentPillar.COVER,
    EMOTIONAL: ContentPillar.EMOTIONAL,
    FINANCIAL: ContentPillar.FINANCIAL,
    NUTRITION: ContentPillar.NUTRITION,
    CLOSING: ContentPillar.CLOSING,
  };

  const created = await prisma.$transaction(async (tx) => {
    const existing = await tx.marketingCarousel.findUnique({
      where: { forDate },
    });

    const rot = await tx.marketingRotationState.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        emotionalNext: 0,
        financialNext: 0,
        nutritionNext: 0,
      },
      update: {},
    });

    let emoIdx: number;
    let finIdx: number;
    let nutIdx: number;

    if (existing) {
      emoIdx = existing.emotionalThemeIndex % emoLen;
      finIdx = existing.financialThemeIndex % finLen;
      nutIdx = existing.nutritionThemeIndex % nutLen;
    } else {
      emoIdx = rot.emotionalNext % emoLen;
      finIdx = rot.financialNext % finLen;
      nutIdx = rot.nutritionNext % nutLen;
    }

    const slides = generateCarouselSlidesFromIndices(
      key,
      emoIdx,
      finIdx,
      nutIdx
    );

    if (existing) {
      await tx.marketingCarousel.delete({ where: { id: existing.id } });
    }

    const carousel = await tx.marketingCarousel.create({
      data: {
        forDate,
        title,
        emotionalThemeIndex: emoIdx,
        financialThemeIndex: finIdx,
        nutritionThemeIndex: nutIdx,
        slides: {
          create: slides.map((s) => ({
            order: s.order,
            pillar: pillarMap[s.pillar],
            headline: s.headline,
            body: s.body,
            hashtags: s.hashtags,
          })),
        },
      },
    });

    if (!existing) {
      await tx.marketingRotationState.update({
        where: { id: "default" },
        data: {
          emotionalNext: (rot.emotionalNext + 1) % emoLen,
          financialNext: (rot.financialNext + 1) % finLen,
          nutritionNext: (rot.nutritionNext + 1) % nutLen,
        },
      });
    }

    return tx.marketingCarousel.findUnique({
      where: { id: carousel.id },
      include: { slides: { orderBy: { order: "asc" } } },
    });
  });

  return NextResponse.json({
    ok: true,
    carousel: created,
  });
}
