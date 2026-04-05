import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureDefaultServices } from "@/lib/seed";

type Body = {
  enabled?: boolean;
  emailTo?: string;
  notifyOnOpen?: boolean;
  notifyOnResolve?: boolean;
  action?: "EMAIL";
};

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ serviceKey: string }> }
) {
  await ensureDefaultServices();
  const { serviceKey } = await ctx.params;
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Body inválido." }, { status: 400 });
  }

  const enabled = Boolean(body.enabled);
  const emailTo = typeof body.emailTo === "string" ? body.emailTo : "";
  const notifyOnOpen = body.notifyOnOpen !== false;
  const notifyOnResolve = body.notifyOnResolve !== false;
  const action = body.action === "EMAIL" ? "EMAIL" : "EMAIL";

  const service = await prisma.service.findUnique({
    where: { key: serviceKey },
  });
  if (!service) {
    return NextResponse.json(
      { ok: false, error: "Servicio no encontrado." },
      { status: 404 }
    );
  }

  await prisma.agentRule.upsert({
    where: { serviceId: service.id },
    create: {
      serviceId: service.id,
      enabled,
      emailTo,
      notifyOnOpen,
      notifyOnResolve,
      action,
    },
    update: {
      enabled,
      emailTo,
      notifyOnOpen,
      notifyOnResolve,
      action,
    },
  });

  return NextResponse.json({ ok: true });
}
