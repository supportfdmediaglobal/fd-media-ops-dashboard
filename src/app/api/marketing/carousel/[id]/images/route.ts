import { NextResponse } from "next/server";
import { InstagramPublishStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import fs from "fs/promises";
import { chromium } from "playwright";
import { outputDirForCarousel, outputPathForSlide } from "@/lib/marketing/imageGen";
import { renderSlideHtml } from "@/lib/marketing/renderMarketingHtml";

export const dynamic = "force-dynamic";

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const carousel = await prisma.marketingCarousel.findUnique({
      where: { id },
      include: { slides: { orderBy: { order: "asc" } } },
    });
    if (!carousel) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    if (carousel.slides.length === 0) {
      return NextResponse.json(
        { error: "El carrusel no tiene diapositivas. Regenera el carrusel." },
        { status: 400 }
      );
    }

    const outDir = outputDirForCarousel(id);
    await ensureDir(outDir);

    let browser;
    try {
      browser = await chromium.launch({
        headless: true,
        args: ["--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage"],
      });
    } catch (launchErr) {
      const hint =
        launchErr instanceof Error ? launchErr.message : String(launchErr);
      return NextResponse.json(
        {
          error:
            "No se pudo iniciar Chromium (Playwright). En el servidor ejecuta: npx playwright install chromium",
          detail: hint,
        },
        { status: 500 }
      );
    }

    const forDateISO = carousel.forDate.toISOString();

    try {
      for (const slide of carousel.slides) {
        const page = await browser.newPage({
          viewport: { width: 1080, height: 1350 },
          deviceScaleFactor: 2,
        });
        try {
          const html = await renderSlideHtml({
            forDateISO,
            slide: {
              pillar: slide.pillar,
              headline: slide.headline,
              body: slide.body,
              hashtags: slide.hashtags,
            },
          });
          await page.setContent(html, {
            waitUntil: "domcontentloaded",
            timeout: 60_000,
          });
          await new Promise((r) => setTimeout(r, 300));

          const outPath = outputPathForSlide(id, slide.order);
          await page.screenshot({
            path: outPath,
            fullPage: false,
            clip: { x: 0, y: 0, width: 1080, height: 1350 },
          });
        } finally {
          await page.close().catch(() => {});
        }
      }
    } finally {
      await browser.close().catch(() => {});
    }

    await prisma.marketingCarousel.update({
      where: { id },
      data: {
        instagramPublishStatus: InstagramPublishStatus.PENDING_APPROVAL,
        imagesGeneratedAt: new Date(),
        approvedAt: null,
        publishedAt: null,
        instagramMediaId: null,
        instagramPublishError: null,
      },
    });

    const publicBase = `/generated/marketing/${id}`;
    return NextResponse.json({
      ok: true,
      images: carousel.slides.map((s) => ({
        order: s.order,
        url: `${publicBase}/slide-${s.order}.png`,
      })),
    });
  } catch (e) {
    console.error("[marketing/images]", e);
    const message = e instanceof Error ? e.message : "Error al generar imágenes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
