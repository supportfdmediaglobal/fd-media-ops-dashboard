import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { InstagramPublishStatus } from "@prisma/client";
import fs from "fs/promises";
import { chromium } from "playwright";
import {
  outputDirForCarousel,
  outputPathForPhrase,
  phraseRenderUrl,
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
    const page = await browser.newPage({
      viewport: { width: 1080, height: 1350 },
      deviceScaleFactor: 2,
    });
    try {
      const url = phraseRenderUrl(id);
      await page.goto(url, { waitUntil: "load" });
      await page.waitForTimeout(150);

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
}
