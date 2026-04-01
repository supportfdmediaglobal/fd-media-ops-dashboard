import { NextResponse } from "next/server";
import { InstagramPublishStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import fs from "fs/promises";
import { chromium } from "playwright";
import {
  outputDirForCarousel,
  outputPathForSlide,
  slideRenderUrl,
} from "@/lib/marketing/imageGen";

export const dynamic = "force-dynamic";

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

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

  const outDir = outputDirForCarousel(id);
  await ensureDir(outDir);

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    for (const slide of carousel.slides) {
      const page = await browser.newPage({
        viewport: { width: 1080, height: 1350 },
        deviceScaleFactor: 2,
      });
      try {
        const url = slideRenderUrl(id, slide.order);
        await page.goto(url, { waitUntil: "load" });
        await page.waitForTimeout(100);

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
}

