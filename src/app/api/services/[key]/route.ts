import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_SERVICES } from "@/lib/services";

/** Quita un servicio del monitoreo (checks e incidentes asociados se eliminan en cascada). */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ key: string }> }
) {
  const raw = (await ctx.params).key;
  const key = decodeURIComponent(raw);

  const service = await prisma.service.findUnique({ where: { key } });
  if (!service) {
    return NextResponse.json(
      { ok: false, error: "Servicio no encontrado." },
      { status: 404 }
    );
  }

  const isCatalogDefault = DEFAULT_SERVICES.some((d) => d.id === key);

  await prisma.$transaction(async (tx) => {
    if (isCatalogDefault) {
      await tx.seedServiceExclusion.upsert({
        where: { key },
        create: { key },
        update: {},
      });
    }
    await tx.service.delete({ where: { key } });
  });

  return NextResponse.json({ ok: true });
}
