import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureDefaultServices } from "@/lib/seed";

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

