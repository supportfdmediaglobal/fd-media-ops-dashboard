import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import archiver from "archiver";
import fs from "fs";
import { PassThrough } from "stream";
import { outputDirForCarousel } from "@/lib/marketing/imageGen";

export const dynamic = "force-dynamic";

export async function GET(
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

  const dir = outputDirForCarousel(id);
  if (!fs.existsSync(dir)) {
    return NextResponse.json(
      { error: "Primero genera las imágenes." },
      { status: 400 }
    );
  }

  const forLabel = carousel.forDate.toISOString().slice(0, 10);
  const filename = `fdbienestar-carrusel-${forLabel}.zip`;

  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = new PassThrough();
  archive.pipe(stream);
  archive.directory(dir, false);
  void archive.finalize();

  return new NextResponse(stream as any, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
    },
  });
}

