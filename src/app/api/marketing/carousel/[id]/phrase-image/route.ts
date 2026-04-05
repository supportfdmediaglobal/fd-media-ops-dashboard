import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { InstagramPublishStatus } from "@prisma/client";
import fs from "fs/promises";
import { chromium } from "playwright";
import { outputDirForCarousel, outputPathForPhrase } from "@/lib/marketing/imageGen";
import { renderPhraseHtml } from "@/lib/marketing/renderMarketingHtml";

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
    });
    if (!carousel) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
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
            "No se pudo iniciar Chromium (Playwright). Ejecuta: npx playwright install chromium",
          detail: hint,
        },
        { status: 500 }
      );
    }

    const dateKey = carousel.forDate.toISOString().slice(0, 10);

    try {
      const page = await browser.newPage({
        viewport: { width: 1080, height: 1350 },
        deviceScaleFactor: 2,
      });
      try {
        const html = await renderPhraseHtml({
          dateKey,
          emotionalThemeIndex: carousel.emotionalThemeIndex,
          financialThemeIndex: carousel.financialThemeIndex,
          nutritionThemeIndex: carousel.nutritionThemeIndex,
        });
        await page.setContent(html, {
          waitUntil: "domcontentloaded",
          timeout: 60_000,
        });
        await new Promise((r) => setTimeout(r, 350));

        const outPath = outputPathForPhrase(id);
        await page.screenshot({
          path: outPath,
          fullPage: false,
          clip: { x: 0, y: 0, width: 1080, height: 1350 },
        });
      } finally {
        await page.close().catch(() => {});
      }
    } finally {
      await browser.close().catch(() => {});
    }

    await prisma.marketingCarousel.update({
      where: { id },
      data: {
        phrasePublishStatus: InstagramPublishStatus.PENDING_APPROVAL,
        phraseGeneratedAt: new Date(),
        phraseApprovedAt: null,
        phrasePublishedAt: null,
        phraseInstagramMediaId: null,
        phrasePublishError: null,
      },
    });

    return NextResponse.json({
      ok: true,
      url: `/generated/marketing/${id}/frase-del-dia.png`,
    });
  } catch (e) {
    console.error("[marketing/phrase-image]", e);
    const message =
      e instanceof Error ? e.message : "Error al generar la imagen de la frase";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
