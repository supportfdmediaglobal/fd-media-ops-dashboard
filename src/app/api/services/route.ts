import { NextResponse } from "next/server";
import { HttpMethod } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ensureDefaultServices } from "@/lib/seed";
import { slugifyServiceKey } from "@/lib/serviceKey";

export async function GET() {
  await ensureDefaultServices();
  const services = await prisma.service.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    services: services.map((s) => ({
      id: s.key,
      name: s.name,
      url: s.url,
      method: s.method,
      expectedStatus: s.expectedStatus,
      timeoutMs: s.timeoutMs,
      optionalKeyword: s.optionalKeyword ?? undefined,
      isEnabled: s.isEnabled,
    })),
  });
}

type PostBody = {
  name?: string;
  url?: string;
  key?: string;
  method?: string;
  expectedStatus?: number;
  timeoutMs?: number;
  optionalKeyword?: string;
};

/** Alta de servicio HTTP a monitorear (worker lo incluirá en el siguiente ciclo). */
export async function POST(req: Request) {
  await ensureDefaultServices();
  const body = (await req.json().catch(() => null)) as PostBody | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Body inválido." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const urlRaw = typeof body.url === "string" ? body.url.trim() : "";
  if (!name || !urlRaw) {
    return NextResponse.json(
      { ok: false, error: "Nombre y URL son obligatorios." },
      { status: 400 }
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlRaw);
  } catch {
    return NextResponse.json(
      { ok: false, error: "La URL no es válida (incluye https:// o http://)." },
      { status: 400 }
    );
  }
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { ok: false, error: "Solo se permiten URLs http o https." },
      { status: 400 }
    );
  }

  const baseKey = body.key?.trim()
    ? slugifyServiceKey(body.key)
    : slugifyServiceKey(name);

  let key = baseKey;
  let n = 0;
  while (await prisma.service.findUnique({ where: { key } })) {
    n += 1;
    key = `${baseKey}-${n}`;
  }

  const method: HttpMethod =
    body.method === "HEAD" ? HttpMethod.HEAD : HttpMethod.GET;

  const expectedStatus = Number(body.expectedStatus);
  const es =
    Number.isFinite(expectedStatus) && expectedStatus >= 100 && expectedStatus <= 599
      ? Math.floor(expectedStatus)
      : 200;

  const timeoutRaw = Number(body.timeoutMs);
  const timeoutMs = Number.isFinite(timeoutRaw)
    ? Math.min(Math.max(Math.floor(timeoutRaw), 1_000), 120_000)
    : 10_000;

  const optionalKeyword =
    typeof body.optionalKeyword === "string" && body.optionalKeyword.trim()
      ? body.optionalKeyword.trim()
      : null;

  const created = await prisma.service.create({
    data: {
      key,
      name,
      url: urlRaw,
      method,
      expectedStatus: es,
      timeoutMs,
      optionalKeyword,
      isEnabled: true,
    },
  });

  return NextResponse.json({
    ok: true,
    service: {
      key: created.key,
      name: created.name,
      url: created.url,
      method: created.method,
      expectedStatus: created.expectedStatus,
      timeoutMs: created.timeoutMs,
    },
  });
}

