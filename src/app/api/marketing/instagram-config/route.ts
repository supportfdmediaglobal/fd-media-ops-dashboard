import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: datos no sensibles para el formulario (el token no se devuelve completo). */
export async function GET() {
  const row = await prisma.marketingInstagramConfig.findUnique({
    where: { id: "default" },
  });
  const hasAccessToken = Boolean(
    row?.accessToken?.trim() || process.env.INSTAGRAM_ACCESS_TOKEN?.trim()
  );
  return NextResponse.json({
    businessAccountId: row?.businessAccountId ?? null,
    hasAccessToken,
    envFallback: Boolean(
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim() &&
        process.env.INSTAGRAM_ACCESS_TOKEN?.trim()
    ),
  });
}

export async function PUT(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    businessAccountId?: string;
    accessToken?: string;
  };

  const existing = await prisma.marketingInstagramConfig.findUnique({
    where: { id: "default" },
  });

  const nextId = body.businessAccountId?.trim() ?? existing?.businessAccountId ?? null;
  let nextToken = existing?.accessToken ?? null;
  if (typeof body.accessToken === "string") {
    const t = body.accessToken.trim();
    if (t.length > 0) nextToken = t;
  }

  await prisma.marketingInstagramConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      businessAccountId: nextId,
      accessToken: nextToken,
    },
    update: {
      businessAccountId: nextId,
      ...(typeof body.accessToken === "string" && body.accessToken.trim().length > 0
        ? { accessToken: body.accessToken.trim() }
        : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
